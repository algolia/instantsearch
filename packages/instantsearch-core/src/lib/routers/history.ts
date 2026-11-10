import { safelyRunOnBrowser, warning } from '../utils';

import { parseQueryString, stringifyQueryString } from './queryString';

import type { Router, RouterWriteOptions, UiState } from '../../types';

type CreateURL<TRouteState> = (args: {
  routeState: TRouteState;
  currentURL: URL;
}) => string;

type ParseURL<TRouteState> = (args: { currentURL: URL }) => TRouteState;

export type BrowserHistoryArgs<TRouteState> = {
  windowTitle?: (routeState: TRouteState) => string;
  writeDelay: number;
  createURL: CreateURL<TRouteState>;
  parseURL: ParseURL<TRouteState>;
  getCurrentURL: () => URL;
  start?: (onUpdate: () => void) => void;
  dispose?: () => void;
  push?: (url: string) => void;
  /**
   * Whether the URL should be cleaned up when the router is disposed.
   * This can be useful when closing a modal containing InstantSearch, to
   * remove active refinements from the URL.
   * @default false
   */
  cleanUrlOnDispose?: boolean;
};

const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null;

const setWindowTitle = (title?: string): void => {
  if (title) {
    // This function is only executed on browsers so we can disable this check.
    // eslint-disable-next-line no-restricted-globals
    window.document.title = title;
  }
};

class BrowserHistory<TRouteState> implements Router<TRouteState> {
  public $$type = 'ais.browser';
  /**
   * Transforms a UI state into a title for the page.
   */
  private readonly windowTitle?: BrowserHistoryArgs<TRouteState>['windowTitle'];
  /**
   * Time in milliseconds before performing a write in the history.
   * It prevents from adding too many entries in the history and
   * makes the back button more usable.
   *
   * @default 400
   */
  private readonly writeDelay: Required<
    BrowserHistoryArgs<TRouteState>
  >['writeDelay'];
  /**
   * Creates a full URL based on the route state.
   * The storage adaptor maps all syncable keys to the query string of the URL.
   */
  private readonly _createURL: Required<
    BrowserHistoryArgs<TRouteState>
  >['createURL'];
  /**
   * Parses the URL into a route state.
   * It should be symmetrical to `createURL`.
   */
  private readonly parseURL: Required<
    BrowserHistoryArgs<TRouteState>
  >['parseURL'];
  /**
   * Returns the current URL.
   * @default () => new URL(window.location.href)
   */
  private readonly getCurrentURL: Required<
    BrowserHistoryArgs<TRouteState>
  >['getCurrentURL'];

  private writeTimer?: ReturnType<typeof setTimeout>;
  private _onPopState?: (event: PopStateEvent) => void;

  /**
   * The route states read on popstate (back/forward in the browser). A write
   * applying one of them must not push it: the URL already reflects it.
   */
  private popStateRouteStates = new WeakSet<object>();

  /**
   * Indicates whether the history router is disposed or not.
   */
  protected isDisposed: boolean = false;

  /**
   * Indicates the window.history.length before the last call to
   * window.history.pushState (called in `write`).
   * It allows to determine if a `pushState` has been triggered elsewhere,
   * and thus to prevent the `write` method from calling `pushState`.
   */
  private latestAcknowledgedHistory: number = 0;

  private _start?: (onUpdate: () => void) => void;
  private _dispose?: () => void;
  private _push?: (url: string) => void;
  private _cleanUrlOnDispose: boolean;

  /**
   * Initializes a new storage provider that syncs the search state to the URL
   * using web APIs (`window.location.pushState` and `onpopstate` event).
   */
  public constructor({
    windowTitle,
    writeDelay = 400,
    createURL,
    parseURL,
    getCurrentURL,
    start,
    dispose,
    push,
    cleanUrlOnDispose,
  }: BrowserHistoryArgs<TRouteState>) {
    this.windowTitle = windowTitle;
    this.writeTimer = undefined;
    this.writeDelay = writeDelay;
    this._createURL = createURL;
    this.parseURL = parseURL;
    this.getCurrentURL = getCurrentURL;
    this._start = start;
    this._dispose = dispose;
    this._push = push;
    this._cleanUrlOnDispose = cleanUrlOnDispose ?? false;

    safelyRunOnBrowser(({ window: browserWindow }) => {
      const title = this.windowTitle && this.windowTitle(this.read());
      setWindowTitle(title);

      this.latestAcknowledgedHistory = browserWindow.history.length;
    });
  }

  /**
   * Reads the URL and returns a syncable UI search state.
   */
  public read(): TRouteState {
    return this.parseURL({ currentURL: this.getCurrentURL() });
  }

  /**
   * Pushes a search state into the URL.
   */
  public write(
    routeState: TRouteState,
    { source }: RouterWriteOptions<TRouteState> = {}
  ): void {
    safelyRunOnBrowser(({ window: browserWindow }) => {
      const url = this.createURL(routeState);
      const title = this.windowTitle && this.windowTitle(routeState);
      // Without a source, the route state can be the one read on popstate.
      const popStateRouteState = source === undefined ? routeState : source;
      const causedByPopState =
        isObject(popStateRouteState) &&
        this.popStateRouteStates.has(popStateRouteState);

      // Only this write is caused by the popstate, not later ones of the same
      // route state object.
      if (causedByPopState) {
        this.popStateRouteStates.delete(popStateRouteState);
      }

      if (this.writeTimer) {
        clearTimeout(this.writeTimer);
      }

      this.writeTimer = setTimeout(() => {
        setWindowTitle(title);

        if (!causedByPopState && this.shouldWrite(url)) {
          if (this._push) {
            this._push(url);
          } else {
            browserWindow.history.pushState(routeState, title || '', url);
          }
          this.latestAcknowledgedHistory = browserWindow.history.length;
        }
        this.writeTimer = undefined;
      }, this.writeDelay);
    });
  }

  /**
   * Sets a callback on the `onpopstate` event of the history API of the current page.
   * It enables the URL sync to keep track of the changes.
   */
  public onUpdate(callback: (routeState: TRouteState) => void): void {
    if (this._start) {
      this._start(() => {
        callback(this.read());
      });
    }

    this._onPopState = () => {
      if (this.writeTimer) {
        clearTimeout(this.writeTimer);
        this.writeTimer = undefined;
      }

      // We always read the state from the URL because the state of the history
      // can be incorect in some cases (e.g. using React Router).
      const routeState = this.read();

      if (isObject(routeState)) {
        this.popStateRouteStates.add(routeState);
      }

      callback(routeState);
    };

    safelyRunOnBrowser(({ window: browserWindow }) => {
      browserWindow.addEventListener('popstate', this._onPopState!);
    });
  }

  /**
   * Creates a complete URL from a given syncable UI state.
   *
   * It always generates the full URL, not a relative one.
   * This allows to handle cases like using a <base href>.
   * See: https://github.com/algolia/instantsearch/issues/790
   */
  public createURL(routeState: TRouteState): string {
    const url = this._createURL({
      routeState,
      currentURL: this.getCurrentURL(),
    });

    if (__DEV__) {
      try {
        // We just want to check if the URL is valid.
        // eslint-disable-next-line no-new
        new URL(url);
      } catch (e) {
        warning(
          false,
          `The URL returned by the \`createURL\` function is invalid.
Please make sure it returns an absolute URL to avoid issues, e.g: \`https://algolia.com/search?query=iphone\`.`
        );
      }
    }

    return url;
  }

  /**
   * Removes the event listener and, when `cleanUrlOnDispose` is true, cleans up the URL.
   */
  public dispose(): void {
    if (this._dispose) {
      this._dispose();
    }

    this.isDisposed = true;

    safelyRunOnBrowser(({ window: browserWindow }) => {
      if (this._onPopState) {
        browserWindow.removeEventListener('popstate', this._onPopState);
      }
    });

    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
    }

    if (this._cleanUrlOnDispose) {
      this.write({} as TRouteState);
    }
  }

  public start() {
    this.isDisposed = false;
  }

  private shouldWrite(url: string): boolean {
    return safelyRunOnBrowser(({ window: browserWindow }) => {
      // When disposed and the cleanUrlOnDispose is set to false, we do not want to write the URL.
      if (this.isDisposed && !this._cleanUrlOnDispose) {
        return false;
      }

      // We do want to `pushState` if:
      // - the router is not disposed, IS.js needs to update the URL
      // OR
      // - the last write was from InstantSearch.js
      // (unlike a SPA, where it would have last written)
      const lastPushWasByISAfterDispose = !(
        this.isDisposed &&
        this.latestAcknowledgedHistory !== browserWindow.history.length
      );

      return (
        // When the previous pushState after dispose was by IS.js, we want to write the URL.
        lastPushWasByISAfterDispose &&
        // When the URL is the same as the current one, we do not want to write it.
        url !== browserWindow.location.href
      );
    });
  }
}

export default function historyRouter<TRouteState = UiState>({
  createURL = ({ routeState, currentURL }) => {
    const { protocol, hostname, port = '', pathname, hash } = currentURL;
    const queryString = stringifyQueryString(routeState);
    const portWithPrefix = port === '' ? '' : `:${port}`;

    // We rebuild the origin from its parts rather than reading `currentURL.origin`
    // because a custom `getCurrentURL` (e.g. for SSR) may return a partial URL
    // object that does not include `origin`.
    if (!queryString) {
      return `${protocol}//${hostname}${portWithPrefix}${pathname}${hash}`;
    }

    return `${protocol}//${hostname}${portWithPrefix}${pathname}?${queryString}${hash}`;
  },
  parseURL = ({ currentURL }) => {
    return parseQueryString(
      currentURL.search.slice(1)
    ) as unknown as TRouteState;
  },
  writeDelay = 400,
  windowTitle,
  getCurrentURL = () => {
    return safelyRunOnBrowser<URL>(
      ({ window: browserWindow }) => new URL(browserWindow.location.href),
      {
        fallback: () => {
          throw new Error(
            'You need to provide `getCurrentURL` to the `history` router in environments where `window` does not exist.'
          );
        },
      }
    );
  },
  start,
  dispose,
  push,
  cleanUrlOnDispose,
}: Partial<BrowserHistoryArgs<TRouteState>> = {}): BrowserHistory<TRouteState> {
  return new BrowserHistory({
    createURL,
    parseURL,
    writeDelay,
    windowTitle,
    getCurrentURL,
    start,
    dispose,
    push,
    cleanUrlOnDispose,
  });
}
