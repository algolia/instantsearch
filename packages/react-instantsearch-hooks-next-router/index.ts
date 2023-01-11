// import { history } from 'instantsearch.js/es/lib/routers';
import { BrowserHistory } from 'instantsearch.js/es/lib/routers/history';
import { safelyRunOnBrowser } from 'instantsearch.js/es/lib/utils';
import nRouter from 'next/router';

import type { UiState } from 'instantsearch.js';
import type { BrowserHistoryArgs } from 'instantsearch.js/es/lib/routers/history';

// export function createInstantSearchNextRouter<TRouteState = UiState>(
//   url: string | undefined,
//   options?: Partial<
//     Omit<
//       BrowserHistoryArgs<TRouteState>,
//       'getLocation' | 'onUpdate' | 'dispose'
//     >
//   >
// ): Router<TRouteState> {
//   let handler: () => void;

//   return history({
//     ...options,
//     getLocation() {
//       if (typeof window === 'undefined') {
//         return new URL(url!) as unknown as Location;
//       }

//       return window.location;
//     },
//     onUpdate(cb, browserHistory) {
//       handler = () => cb(browserHistory.read());
//       nextRouter.events.on('routeChangeComplete', handler);
//     },
//     dispose() {
//       console.log(window.location, JSON.stringify(window.history.state));
//       // @ts-ignore
//       console.log(this.read?.());

//       // nextRouter.replace(window.location.href, {});
//       nextRouter.events.off('routeChangeComplete', handler);
//     },
//   });
// }
const setWindowTitle = (title?: string): void => {
  if (title) {
    // This function is only executed on browsers so we can disable this check.
    window.document.title = title;
  }
};

class NextHistory<TRouteState> extends BrowserHistory<TRouteState> {
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
          console.log(url, routeState);

          nRouter.push({ href: url }, url, { shallow: true });
          // window.history.pushState(routeState, title || '', url);
          this.latestAcknowledgedHistory = window.history.length;
        }
        this.inPopState = false;
        this.writeTimer = undefined;
      }, this.writeDelay);
    });
  }
}

export function nextRouter<TRouteState = UiState>(
  url: string | undefined,
  {
    createURL = ({ qsModule, routeState, location }) => {
      const { protocol, hostname, port = '', pathname, hash } = location;
      const queryString = qsModule.stringify(routeState);
      const portWithPrefix = port === '' ? '' : `:${port}`;

      // IE <= 11 has no proper `location.origin` so we cannot rely on it.
      if (!queryString) {
        return `${protocol}//${hostname}${portWithPrefix}${pathname}${hash}`;
      }

      return `${protocol}//${hostname}${portWithPrefix}${pathname}?${queryString}${hash}`;
    },
    parseURL = ({ qsModule, location }) => {
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
      return qsModule.parse(location.search.slice(1), {
        arrayLimit: 99,
      }) as unknown as TRouteState;
    },
    writeDelay = 400,
    windowTitle,
    getLocation = () => {
      if (typeof window === 'undefined') {
        return new URL(url!) as unknown as Location;
      }

      return window.location;
    },
    onUpdate,
    dispose,
  }: Partial<BrowserHistoryArgs<TRouteState>> = {}
): BrowserHistory<TRouteState> {
  return new NextHistory({
    createURL,
    parseURL,
    writeDelay,
    windowTitle,
    getLocation,
    onUpdate,
    dispose,
  });
}
