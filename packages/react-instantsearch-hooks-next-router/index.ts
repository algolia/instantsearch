import { history } from 'instantsearch.js/es/lib/routers';
import nextRouter from 'next/router';

import type { Router, UiState } from 'instantsearch.js';
import type { BrowserHistoryArgs } from 'instantsearch.js/es/lib/routers/history';

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

  if (typeof window !== 'undefined') {
    nextRouter.beforePopState(() => {
      const asPathWithoutParams = nextRouter.asPath.split('?')[0];
      let pathname = new URL(window.location.href).pathname;
      if (nextRouter.locale) {
        pathname = pathname.replace(
          asPathWithoutParams === '/'
            ? nextRouter.locale
            : `/${nextRouter.locale}`,
          ''
        );
      }
      // We only want to trigger SSR when going back/forward to a different page
      return asPathWithoutParams !== pathname;
    });
  }

  return history({
    ...options,
    getLocation() {
      if (typeof window === 'undefined') {
        return new URL(url!) as unknown as Location;
      }

      return window.location;
    },
    onUpdate(cb, browserHistory) {
      handler = () => {
        cb(browserHistory.read());
      };
      nextRouter.events.on('routeChangeComplete', handler);
    },
    dispose() {
      nextRouter.events.off('routeChangeComplete', handler);
      nextRouter.beforePopState(() => true);
    },
    push(newUrl) {
      nextRouter.push(
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
