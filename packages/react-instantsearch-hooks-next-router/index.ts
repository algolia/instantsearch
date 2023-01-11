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

  return history({
    ...options,
    getLocation() {
      if (typeof window === 'undefined') {
        return new URL(url!) as unknown as Location;
      }

      return window.location;
    },
    onUpdate(cb, browserHistory) {
      handler = () => cb(browserHistory.read());
      nextRouter.events.on('routeChangeComplete', handler);
    },
    dispose() {
      nextRouter.events.off('routeChangeComplete', handler);
    },
  });
}
