import { historyRouter } from 'instantsearch-core';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRef, useEffect } from 'react';

import { useNextHeaders } from './useNextHeaders';

import type { InstantSearchNextProps } from './InstantSearchNext';
import type { UiState, BrowserHistoryArgs } from 'instantsearch-core';
import type { InstantSearchProps } from 'react-instantsearch-core';

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

  useEffect(() => {
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
