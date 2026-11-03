import { history as historyRouter } from 'instantsearch-core';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRef, useEffect } from 'react';

import { useNextHeaders } from './useNextHeaders';

import type { InstantSearchNextProps } from './InstantSearchNext';
import type { UiState } from 'instantsearch-core';
import type { BrowserHistoryArgs } from 'instantsearch-core';
import type { InstantSearchProps } from 'react-instantsearch-core';

export function useInstantSearchRouting<
  TUiState extends UiState = UiState,
  TRouteState = TUiState,
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
  // Skip the on-mount fire of the effect below: `subscribe()` already merges
  // the URL into `_initialUiState`, and a redundant `setUiState` can wipe the
  // URL with a nested `<Index>` (see #6980).
  const previousRouteRef = useRef<string | null>(null);
  // The URL the router is in sync with: the last one it wrote itself, or applied
  // on `popstate`. Next.js commits it to `pathname` / `searchParams` a bit later, and the UI state is
  // already up to date for it. Reading it back would at best search again, and
  // at worst apply a state that a newer, not yet written refinement has
  // replaced.
  const syncedHrefRef = useRef<string | null>(null);

  useEffect(() => {
    const currentRoute = `${pathname ?? ''}?${searchParams?.toString() ?? ''}`;

    if (previousRouteRef.current === currentRoute) {
      return;
    }

    const isFirstRun = previousRouteRef.current === null;
    previousRouteRef.current = currentRoute;

    if (isFirstRun) {
      return;
    }

    if (window.location.href === syncedHrefRef.current) {
      return;
    }
    syncedHrefRef.current = window.location.href;

    if (onUpdateRef.current) {
      onUpdateRef.current();
    }
  }, [pathname, searchParams]);

  const hasRouting = Boolean(passedRouting);

  useEffect(() => {
    if (!hasRouting) {
      return undefined;
    }

    // The history router applies the URL itself on `popstate`, before Next.js
    // commits it.
    const onPopState = () => {
      syncedHrefRef.current = window.location.href;
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [hasRouting]);

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

    // Wrapped after the user's options are merged, so a custom `push` is
    // tracked as well. Without one, the router pushes the state itself.
    const configuredPush = browserHistoryOptions.push;
    if (configuredPush) {
      browserHistoryOptions.push = function push(
        this: ReturnType<typeof historyRouter>,
        url
      ) {
        configuredPush.call(this, url);
        // The URL it is pushing to, as a push that happens later would land on.
        syncedHrefRef.current = new URL(url, window.location.href).href;
      };
    }

    routingRef.current.router = historyRouter(browserHistoryOptions);
  }

  return routingRef.current;
}
