import nextRouterSingleton from 'next/router';

import history from './history';

import type { BrowserHistoryArgs } from './history';
import type { Router, UiState } from 'instantsearch.js';
import type { Router as NextRouter } from 'next/router';

export function createInstantSearchNextRouter<TRouteState = UiState>(options?: {
  serverUrl?: string;
  doNotOverrideBeforePopState?: boolean;
  routerOptions?: Partial<
    Omit<BrowserHistoryArgs<TRouteState>, 'onUpdate' | 'dispose'>
  > & {
    beforeStart?: BrowserHistoryArgs<TRouteState>['onUpdate'];
    beforeDispose?: BrowserHistoryArgs<TRouteState>['dispose'];
  };
}): Router<TRouteState> {
  const { beforeStart, beforeDispose, ...browserHistoryOptions } =
    options?.routerOptions ?? {};

  let handler: () => void;
  let previousBeforePopState: NonNullable<NextRouter['_bps']> = () => true;

  return history({
    getLocation() {
      if (typeof window === 'undefined') {
        return new URL(options?.serverUrl!) as unknown as Location;
      }

      return window.location;
    },
    onUpdate(cb, browserHistory) {
      if (beforeStart) {
        beforeStart(cb, browserHistory);
      }

      let initialPathname: string;

      if (
        typeof window !== 'undefined' &&
        !options?.doNotOverrideBeforePopState
      ) {
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
      if (beforeDispose) {
        beforeDispose();
      }

      nextRouterSingleton.events.off('routeChangeComplete', handler);
      if (!options?.doNotOverrideBeforePopState) {
        nextRouterSingleton.beforePopState(previousBeforePopState);
      }
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
    ...browserHistoryOptions,
  });
}
