import qs from 'qs';

import { safelyRunOnBrowser, warning } from '../lib/public';

import type { Router, UiState } from '../types';

type CreateURL<TRouteState> = (args: {
  qsModule: typeof qs;
  routeState: TRouteState;
  currentURL: URL;
}) => string;

type ParseURL<TRouteState> = (args: {
  qsModule: typeof qs;
  currentURL: URL;
}) => TRouteState;

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
   * @default true
   */
  cleanUrlOnDispose?: boolean;
};

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
   * Returns the location to store in the history.
   * @default () => new URL(window.location.href)
   */
  private readonly getCurrentURL: Required<
    BrowserHistoryArgs<TRouteState>
  >['getCurrentURL'];

  private writeTimer?: ReturnType<typeof setTimeout>;
  private _onPopState?: (event: PopStateEvent) => void;

  /**
   * Indicates if last action was back/forward in the browser.
   */
  private inPopState: boolean = false;

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
    this._cleanUrlOnDispose = Boolean(cleanUrlOnDispose);

    safelyRunOnBrowser(({ window }) => {
      const title = this.windowTitle && this.windowTitle(this.read());
      setWindowTitle(title);

      this.latestAcknowledgedHistory = window.history.length;
    });
  }

  /**
   * Reads the URL and returns a syncable UI search state.
   */
  public read(): TRouteState {
    return this.parseURL({ qsModule: qs, currentURL: this.getCurrentURL() });
  }

  /**
   * Pushes a search state into the URL.
   */
  public write(routeState: TRouteState): void {
    safelyRunOnBrowser(({ window }) => {
      const url = this.createURL(routeState);
      const title = this.windowTitle && this.windowTitle(routeState);

      if (this.writeTimer) {
        clearTimeout(this.writeTimer);
      }

      this.writeTimer = setTimeout(() => {
        setWindowTitle(title);

        if (this.shouldWrite(url)) {
          if (this._push) {
            this._push(url);
          } else {
            window.history.pushState(routeState, title || '', url);
          }
          this.latestAcknowledgedHistory = window.history.length;
        }
        this.inPopState = false;
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

      this.inPopState = true;

      // We always read the state from the URL because the state of the history
      // can be incorect in some cases (e.g. using React Router).
      callback(this.read());
    };

    safelyRunOnBrowser(({ window }) => {
      window.addEventListener('popstate', this._onPopState!);
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
      qsModule: qs,
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
   * Removes the event listener and cleans up the URL.
   */
  public dispose(): void {
    if (this._dispose) {
      this._dispose();
    }

    this.isDisposed = true;

    safelyRunOnBrowser(({ window }) => {
      if (this._onPopState) {
        window.removeEventListener('popstate', this._onPopState);
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
    return safelyRunOnBrowser(({ window }) => {
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
        this.latestAcknowledgedHistory !== window.history.length
      );

      return (
        // When the last state change was through popstate, the IS.js state changes,
        // but that should not write the URL.
        !this.inPopState &&
        // When the previous pushState after dispose was by IS.js, we want to write the URL.
        lastPushWasByISAfterDispose &&
        // When the URL is the same as the current one, we do not want to write it.
        url !== window.location.href
      );
    });
  }
}

export function historyRouter<TRouteState = UiState>({
  createURL = ({ qsModule, routeState, currentURL }) => {
    const url = new URL(currentURL);
    url.search = qsModule.stringify(routeState);

    return url.href;
  },
  parseURL = ({ qsModule, currentURL }) => {
    // `qs` by default converts arrays with more than 20 items to an object.
    // We want to avoid this because the data structure manipulated can therefore vary.
    // Setting the limit to `100` seems a good number because the engine's default is 100
    // (it can go up to 1000 but it is very unlikely to select more than 100 items in the UI).
    //
    // Using an `arrayLimit` of `n` allows `n + 1` items.
    //
    // See:
    //   - https://github.com/ljharb/qs#parsing-arrays
    //   - https://www.algolia.com/doc/api-reference/api-parameters/maxValuesPerFacet/
    return qsModule.parse(currentURL.search.slice(1), {
      arrayLimit: 99,
    }) as unknown as TRouteState;
  },
  writeDelay = 400,
  windowTitle,
  getCurrentURL = () => {
    return safelyRunOnBrowser<URL>(
      ({ window }) => new URL(window.location.href),
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
