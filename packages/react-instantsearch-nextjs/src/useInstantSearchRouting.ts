import historyRouter from 'instantsearch.js/es/lib/routers/history';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRef, useEffect } from 'react';

import { useNextHeaders } from './useNextHeaders';

import type { InstantSearchNextProps } from './InstantSearchNext';
import type { UiState } from 'instantsearch.js';
import type { BrowserHistoryArgs } from 'instantsearch.js/es/lib/routers/history';
import type { InstantSearchProps } from 'react-instantsearch-core';

// Fallback store for the first path an `InstantSearchNext` instance rendered
// with, used only in environments without the Navigation Timing API (e.g.
// jsdom in tests). See `getInitialPath` below.
const InstantSearchDocumentPath = Symbol.for('InstantSearchDocumentPath');
declare global {
  interface Window {
    [InstantSearchDocumentPath]?: string;
  }
}

/**
 * The pathname the document was initially loaded with.
 *
 * It comes from the Navigation Timing API, which reflects the hard page load
 * and is *not* affected by client-side (SPA) navigations, so it lets us tell a
 * genuine initial hydration apart from a client-side navigation — even when the
 * navigation lands on the very first `InstantSearchNext` page of the session
 * (e.g. coming from a page without InstantSearch, see #7060).
 *
 * Falls back to the first path any instance rendered with (stored on `window`)
 * when Navigation Timing is unavailable.
 */
function getInitialPath(currentPath: string): string {
  try {
    const [entry] = performance.getEntriesByType('navigation');
    if (entry && entry.name) {
      return new URL(entry.name).pathname;
    }
  } catch (e) {
    // Navigation Timing not available; fall through to the `window` fallback.
  }

  if (window[InstantSearchDocumentPath] === undefined) {
    window[InstantSearchDocumentPath] = currentPath;
  }
  return window[InstantSearchDocumentPath];
}

export function useInstantSearchRouting<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
>(
  passedRouting: InstantSearchNextProps<TUiState, TRouteState>['routing'],
  isMounting: React.RefObject<boolean>
) {
  const isServer = typeof window === 'undefined';
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routingRef =
    useRef<InstantSearchProps<TUiState, TRouteState>['routing']>(null);
  const onUpdateRef = useRef<() => void>(null);
  const isUnmounting = useRef(false);
  const previousRouteRef = useRef<string | null>(null);

  useEffect(() => {
    const currentRoute = `${pathname ?? ''}?${searchParams?.toString() ?? ''}`;

    if (previousRouteRef.current === currentRoute) {
      return;
    }

    const isFirstRun = previousRouteRef.current === null;
    previousRouteRef.current = currentRoute;

    if (isFirstRun) {
      // First run of a freshly mounted instance. On the genuine initial
      // hydration we must skip `onUpdate`: `subscribe()` already merged the URL
      // into `_initialUiState`, and a redundant `setUiState` can wipe the URL
      // with a nested `<Index>` (see #6980/#6995). But when the document was
      // initially loaded on a different path, this mount is the result of a
      // client-side navigation and we must run `onUpdate` to refresh the
      // results, otherwise the new page shows stale or empty hits (see #7060).
      // We compare `window.location.pathname` (not `usePathname()`) so the
      // comparison is consistent with the Navigation Timing URL when a
      // `basePath` is configured (`usePathname()` strips it, the others don't).
      const currentPath = window.location.pathname;
      const isClientNavigation = getInitialPath(currentPath) !== currentPath;

      if (!isClientNavigation) {
        return;
      }
    }

    if (onUpdateRef.current) {
      onUpdateRef.current();
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    isUnmounting.current = false;
    return () => {
      isUnmounting.current = true;
    };
  });

  const headers = useNextHeaders();

  if (passedRouting && !routingRef.current) {
    let browserHistoryOptions: Partial<BrowserHistoryArgs<TRouteState>> = {};

    browserHistoryOptions.getLocation = () => {
      if (isServer) {
        const url = `${
          headers?.get('x-forwarded-proto') || 'http'
        }://${headers?.get('host')}${pathname}?${searchParams}`;
        return new URL(url) as unknown as Location;
      }

      if (isMounting.current) {
        return new URL(
          `${window.location.protocol}//${window.location.host}${pathname}?${searchParams}`
        ) as unknown as Location;
      }

      return window.location;
    };
    browserHistoryOptions.push = function push(
      this: ReturnType<typeof historyRouter>,
      url
    ) {
      // This is to skip the push with empty routeState on dispose as it would clear params set on a <Link>
      if (this.isDisposed && isUnmounting.current) {
        return;
      }
      history.pushState({}, '', url);
    };
    browserHistoryOptions.start = function start(onUpdate) {
      onUpdateRef.current = onUpdate;
    };

    routingRef.current = {};
    if (typeof passedRouting === 'object') {
      browserHistoryOptions = {
        ...browserHistoryOptions,
        ...passedRouting.router,
      };
      routingRef.current.stateMapping = passedRouting.stateMapping;
    }
    routingRef.current.router = historyRouter(browserHistoryOptions);
  }

  return routingRef.current;
}
