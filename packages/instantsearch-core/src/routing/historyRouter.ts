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
   * @default false
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

type HistoryRouter<TRouteState> = Router<TRouteState> & {
  isDisposed: boolean;
};

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
}: Partial<BrowserHistoryArgs<TRouteState>> = {}) {
  let writeTimer: ReturnType<typeof setTimeout> | undefined;
  let inPopState = false;
  let onPopState: (() => void) | undefined;
  let latestAcknowledgedHistory = 0;

  function shouldWrite(
    url: string,
    router: HistoryRouter<TRouteState>
  ): boolean {
    return safelyRunOnBrowser(({ window }) => {
      // When disposed and the cleanUrlOnDispose is set to false, we do not want to write the URL.
      if (router.isDisposed && !cleanUrlOnDispose) {
        return false;
      }

      // We do want to `pushState` if:
      // - the router is not disposed, IS.js needs to update the URL
      // OR
      // - the last write was from InstantSearch.js
      // (unlike a SPA, where it would have last written)
      const lastPushWasByISAfterDispose =
        !router.isDisposed ||
        latestAcknowledgedHistory === window.history.length;

      return (
        // When the last state change was through popstate, the IS.js state changes,
        // but that should not write the URL.
        !inPopState &&
        // When the previous pushState after dispose was by IS.js, we want to write the URL.
        lastPushWasByISAfterDispose &&
        // When the URL is the same as the current one, we do not want to write it.
        url !== window.location.href
      );
    });
  }

  const router: HistoryRouter<TRouteState> = {
    /**
     * Identifier of the router.
     */
    $$type: 'ais.browser',

    /**
     * Whether the router has been disposed (no longer active).
     */
    isDisposed: false,

    /**
     * Reads the URL and returns a syncable UI search state.
     */
    read(): TRouteState {
      return parseURL({ qsModule: qs, currentURL: getCurrentURL() });
    },

    /**
     * Pushes a search state into the URL.
     */
    write(routeState: TRouteState): void {
      safelyRunOnBrowser(({ window }) => {
        const url = this.createURL(routeState);
        const title = windowTitle && windowTitle(routeState);

        if (writeTimer) {
          clearTimeout(writeTimer);
        }

        writeTimer = setTimeout(() => {
          setWindowTitle(title);

          if (shouldWrite(url, router)) {
            if (push) {
              push(url);
            } else {
              window.history.pushState(routeState, title || '', url);
            }
            latestAcknowledgedHistory = window.history.length;
          }
          inPopState = false;
          writeTimer = undefined;
        }, writeDelay);
      });
    },

    /**
     * Sets a callback on the `onpopstate` event of the history API of the current page.
     * It enables the URL sync to keep track of the changes.
     */
    onUpdate(callback: (routeState: TRouteState) => void): void {
      if (start) {
        start(() => {
          callback(this.read());
        });
      }

      onPopState = () => {
        if (writeTimer) {
          clearTimeout(writeTimer);
          writeTimer = undefined;
        }

        inPopState = true;

        // We always read the state from the URL because the state of the history
        // can be incorrect in some cases (e.g. using React Router).
        callback(this.read());
      };

      safelyRunOnBrowser(({ window }) => {
        window.addEventListener('popstate', onPopState!);
      });
    },

    /**
     * Creates a complete URL from a given syncable UI state.
     *
     * It always generates the full URL, not a relative one.
     * This allows to handle cases like using a <base href>.
     * See: https://github.com/algolia/instantsearch/issues/790
     */
    createURL(routeState: TRouteState): string {
      const url = createURL({
        qsModule: qs,
        routeState,
        currentURL: getCurrentURL(),
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
    },

    /**
     * Removes the event listener and cleans up the URL.
     */
    dispose(): void {
      if (dispose) {
        dispose();
      }

      this.isDisposed = true;

      safelyRunOnBrowser(({ window }) => {
        if (onPopState) {
          window.removeEventListener('popstate', onPopState);
        }
      });

      if (writeTimer) {
        clearTimeout(writeTimer);
      }

      if (cleanUrlOnDispose) {
        this.write({} as TRouteState);
      }
    },

    start() {
      this.isDisposed = false;
    },
  };

  safelyRunOnBrowser(({ window }) => {
    const title = windowTitle && windowTitle(router.read());
    setWindowTitle(title);

    latestAcknowledgedHistory = window.history.length;
  });

  return router;
}
