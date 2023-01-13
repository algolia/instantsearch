import { history } from 'instantsearch.js/es/lib/routers';
import nextRouterSingleton from 'next/router';

import type { Router, UiState } from 'instantsearch.js';
import type { BrowserHistoryArgs } from 'instantsearch.js/es/lib/routers/history';
import type { Router as NextRouter } from 'next/router';

export function createInstantSearchNextRouter<TRouteState = UiState>(
  url: string | undefined,
  options?: Partial<
    Omit<
      BrowserHistoryArgs<TRouteState>,
      'getLocation' | 'onUpdate' | 'dispose'
    >
  >
): Router<TRouteState> {
  let handler: () => void;
  let previousBeforePopState: NonNullable<NextRouter['_bps']> = () => true;

  return history({
    ...options,
    getLocation() {
      if (typeof window === 'undefined') {
        return new URL(url!) as unknown as Location;
      }

      return window.location;
    },
    onUpdate(cb, browserHistory) {
      let initialPathname: string;

      if (typeof window !== 'undefined') {
        initialPathname = nextRouterSingleton.pathname;

        if (nextRouterSingleton.router?._bps) {
          previousBeforePopState = nextRouterSingleton.router._bps;
        }

        nextRouterSingleton.beforePopState(() => {
          const asPathWithoutParams = nextRouterSingleton.asPath.split('?')[0];
          let pathname = new URL(window.location.href).pathname;
          if (nextRouterSingleton.locale) {
            pathname = pathname.replace(
              asPathWithoutParams === '/'
                ? nextRouterSingleton.locale
                : `/${nextRouterSingleton.locale}`,
              ''
            );
          }
          // We only want to trigger SSR when going back/forward to a different page
          return asPathWithoutParams !== pathname;
        });
      }

      handler = () => {
        if (nextRouterSingleton.pathname === initialPathname) {
          cb(browserHistory.read());
        }
      };
      nextRouterSingleton.events.on('routeChangeComplete', handler);
    },
    dispose() {
      nextRouterSingleton.events.off('routeChangeComplete', handler);
      nextRouterSingleton.beforePopState(previousBeforePopState);
    },
    push(newUrl) {
      nextRouterSingleton.push(
        {
          href: newUrl,
          // SSR needs this
          query: Object.fromEntries(new URL(newUrl).searchParams),
        },
        newUrl,
        {
          shallow: true,
        }
      );
    },
  });
}
