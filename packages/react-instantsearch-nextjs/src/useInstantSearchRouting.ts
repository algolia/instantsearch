import { historyRouter } from 'instantsearch-core';
import { headers } from 'next/headers';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRef, useEffect } from 'react';

import type { InstantSearchNextProps } from './InstantSearchNext';
import type { UiState, BrowserHistoryArgs } from 'instantsearch-core';
import type { InstantSearchProps } from 'react-instantsearch-core';

export function useInstantSearchRouting<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
>(
  passedRouting: InstantSearchNextProps<TUiState, TRouteState>['routing'],
  isMounting: React.MutableRefObject<boolean>
) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routingRef =
    useRef<InstantSearchProps<TUiState, TRouteState>['routing']>();
  const onUpdateRef = useRef<() => void>();
  useEffect(() => {
    if (onUpdateRef.current) {
      onUpdateRef.current();
    }
  }, [pathname, searchParams]);

  if (passedRouting && !routingRef.current) {
    let browserHistoryOptions: Partial<BrowserHistoryArgs<TRouteState>> = {};

    browserHistoryOptions.getCurrentURL = () => {
      if (typeof window === 'undefined') {
        const url = `${
          headers().get('x-forwarded-proto') || 'http'
        }://${headers().get('host')}${pathname}?${searchParams}`;
        return new URL(url);
      }

      if (isMounting.current) {
        return new URL(
          `${window.location.protocol}//${window.location.host}${pathname}?${searchParams}`
        );
      }

      return new URL(window.location.href);
    };
    browserHistoryOptions.push = function push(
      this: ReturnType<typeof historyRouter>,
      url
    ) {
      // This is to skip the push with empty routeState on dispose as it would clear params set on a <Link>
      if (this.isDisposed) {
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
