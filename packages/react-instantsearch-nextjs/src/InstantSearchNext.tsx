import historyRouter from 'instantsearch.js/es/lib/routers/history';
import { safelyRunOnBrowser } from 'instantsearch.js/es/lib/utils';
import { headers } from 'next/headers';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react';
import {
  InstantSearch,
  InstantSearchRSCContext,
  InstantSearchSSRProvider,
} from 'react-instantsearch-core';

import { InitializePromise } from './InitializePromise';
import { TriggerSearch } from './TriggerSearch';
import { warn } from './warn';

import type { InitialResults, StateMapping, UiState } from 'instantsearch.js';
import type { BrowserHistoryArgs } from 'instantsearch.js/es/lib/routers/history';
import type {
  InstantSearchProps,
  PromiseWithState,
} from 'react-instantsearch-core';

const InstantSearchInitialResults = Symbol.for('InstantSearchInitialResults');
declare global {
  interface Window {
    [InstantSearchInitialResults]?: InitialResults;
  }
}

export type InstantSearchNextRouting<TUiState, TRouteState> = {
  router?: Partial<BrowserHistoryArgs<TRouteState>>;
  stateMapping?: StateMapping<TUiState, TRouteState>;
};

export type InstantSearchNextProps<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
> = Omit<InstantSearchProps<TUiState, TRouteState>, 'routing'> & {
  routing?: InstantSearchNextRouting<TUiState, TRouteState> | boolean;
};

export function InstantSearchNext<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
>({
  children,
  routing: passedRouting,
  ...instantSearchProps
}: InstantSearchNextProps<TUiState, TRouteState>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isMounting = useRef(true);
  useEffect(() => {
    isMounting.current = false;
  }, []);

  const promiseRef = useRef<PromiseWithState<void> | null>(null);

  const initialResults = safelyRunOnBrowser(
    () => window[InstantSearchInitialResults]
  );

  const routing: InstantSearchProps<TUiState, TRouteState>['routing'] =
    passedRouting && {};
  if (routing) {
    let browserHistoryOptions: Partial<BrowserHistoryArgs<TRouteState>> = {};

    browserHistoryOptions.getLocation = () => {
      if (typeof window === 'undefined') {
        const url = `${
          headers().get('x-forwarded-proto') || 'http'
        }://${headers().get('host')}${pathname}?${searchParams}`;
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
      if (this.isDisposed) {
        return;
      }
      router.push(url, { scroll: false });
    };

    if (typeof passedRouting === 'object') {
      browserHistoryOptions = {
        ...browserHistoryOptions,
        ...passedRouting.router,
      };
      routing.stateMapping = passedRouting.stateMapping;
    }
    routing.router = historyRouter(browserHistoryOptions);
  }

  warn(
    false,
    `InstantSearchNext relies on experimental APIs and may break in the future.
This message will only be displayed in development mode.`
  );

  return (
    <InstantSearchRSCContext.Provider value={promiseRef}>
      <InstantSearchSSRProvider initialResults={initialResults}>
        <InstantSearch {...instantSearchProps} routing={routing}>
          {!initialResults && <InitializePromise />}
          {children}
          {!initialResults && <TriggerSearch />}
        </InstantSearch>
      </InstantSearchSSRProvider>
    </InstantSearchRSCContext.Provider>
  );
}
