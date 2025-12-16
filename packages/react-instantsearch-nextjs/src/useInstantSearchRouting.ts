import historyRouter from 'instantsearch.js/es/lib/routers/history';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRef, useEffect } from 'react';

import type { InstantSearchNextProps } from './InstantSearchNext';
import type { UiState } from 'instantsearch.js';
import type { BrowserHistoryArgs } from 'instantsearch.js/es/lib/routers/history';
import type { InstantSearchProps } from 'react-instantsearch-core';

export function useInstantSearchRouting<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
>({
  routing,
  isMounting,
  headers,
}: {
  routing: InstantSearchNextProps<TUiState, TRouteState>['routing'];
  isMounting: React.RefObject<boolean>;
  headers?: Headers;
}) {
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

  if (routing && !routingRef.current) {
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
    if (typeof routing === 'object') {
      browserHistoryOptions = {
        ...browserHistoryOptions,
        ...routing.router,
      };
      routingRef.current.stateMapping = routing.stateMapping;
    }
    routingRef.current.router = historyRouter(browserHistoryOptions);
  }

  return routingRef.current;
}
