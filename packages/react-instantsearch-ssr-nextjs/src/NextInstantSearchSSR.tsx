import historyRouter from 'instantsearch.js/es/lib/routers/history';
import { safelyRunOnBrowser } from 'instantsearch.js/es/lib/utils';
import { headers } from 'next/headers';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useRef } from 'react';
import {
  InstantSearch,
  InstantSearchRSCContext,
  InstantSearchSSRProvider,
} from 'react-instantsearch-core';

import { InitializePromise } from './InitializePromise';
import { TriggerSearch } from './TriggerSearch';

import type { InitialResults, StateMapping, UiState } from 'instantsearch.js';
import type { BrowserHistoryArgs } from 'instantsearch.js/es/lib/routers/history';
import type {
  InstantSearchProps,
  PromiseWithState,
} from 'react-instantsearch-core';

const InstantSearchInitialResults = Symbol.for('InstantSearchInitialResults');
declare global {
  interface Window {
    [InstantSearchInitialResults]?: InitialResults[];
  }
}

export type NextInstantSearchSSRRouting<TUiState, TRouteState> = {
  router?: BrowserHistoryArgs<TRouteState>;
  stateMapping?: StateMapping<TUiState, TRouteState>;
};

export type NextInstantSearchSSRProps<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
> = Omit<InstantSearchProps<TUiState, TRouteState>, 'routing'> & {
  routing?: NextInstantSearchSSRRouting<TUiState, TRouteState> | boolean;
};

export function NextInstantSearchSSR<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
>({
  children,
  routing: passedRouting,
  ...instantSearchProps
}: NextInstantSearchSSRProps<TUiState, TRouteState>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const promiseRef = useRef<PromiseWithState<void> | null>(null);

  const initialResults = safelyRunOnBrowser(() =>
    window[InstantSearchInitialResults]?.pop()
  );

  const routing: InstantSearchProps<TUiState, TRouteState>['routing'] =
    passedRouting && {};
  if (routing) {
    let browserHistoryOptions: Partial<BrowserHistoryArgs<TRouteState>> = {};
    browserHistoryOptions.getLocation = () => {
      if (typeof window === 'undefined') {
        let url = `${
          headers().get('x-forwarded-proto') || 'http'
        }://${headers().get('host')}${pathname}`;
        searchParams.size > 0 && (url += `?${searchParams}`);
        return new URL(url) as unknown as Location;
      }
      return window.location;
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
