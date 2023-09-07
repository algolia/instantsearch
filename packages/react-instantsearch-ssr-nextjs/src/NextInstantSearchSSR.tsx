import historyRouter from 'instantsearch.js/es/lib/routers/history';
import { getInitialResults } from 'instantsearch.js/es/lib/server';
import { safelyRunOnBrowser, walkIndex } from 'instantsearch.js/es/lib/utils';
import { headers } from 'next/headers';
import {
  ServerInsertedHTMLContext,
  usePathname,
  useSearchParams,
} from 'next/navigation';
import React, { useContext, useRef } from 'react';
import {
  InstantSearch,
  InstantSearchRSCContext,
  InstantSearchSSRProvider,
  useInstantSearchContext,
  useRSCContext,
  wrapPromiseWithState,
} from 'react-instantsearch-core';

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

function InitializePromise() {
  const search = useInstantSearchContext();
  const waitForResultsRef = useRSCContext();
  const insertHTML =
    useContext(ServerInsertedHTMLContext) ||
    (() => {
      throw new Error('Missing ServerInsertedHTMLContext');
    });

  const waitForResults = () =>
    new Promise<void>((resolve) => {
      search.mainHelper!.derivedHelpers[0].on('result', () => {
        resolve();
      });
    });

  const injectInitialResults = () => {
    const results = getInitialResults(search.mainIndex);
    insertHTML(() => (
      <script
        dangerouslySetInnerHTML={{
          __html: `(window[Symbol.for("InstantSearchInitialResults")] ??= []).push(${JSON.stringify(
            results
          )})`,
        }}
      />
    ));
  };

  if (waitForResultsRef?.current === null) {
    waitForResultsRef.current = wrapPromiseWithState(
      waitForResults()
        .then(() => {
          let shouldRefetch = false;
          walkIndex(search.mainIndex, (index) => {
            shouldRefetch = index
              .getWidgets()
              .some((widget) => widget.$$type === 'ais.dynamicWidgets');
          });

          if (shouldRefetch) {
            waitForResultsRef.current = wrapPromiseWithState(
              waitForResults().then(injectInitialResults)
            );
          }

          return shouldRefetch;
        })
        .then((shouldRefetch) => {
          if (shouldRefetch) {
            return;
          }
          injectInitialResults();
        })
    );
  }

  return null;
}

function TriggerSearch() {
  const instantsearch = useInstantSearchContext();
  const waitForResultsRef = useRSCContext();

  if (waitForResultsRef?.current?.status === 'pending') {
    instantsearch.mainHelper?.searchOnlyWithDerivedHelpers();
  }

  return null;
}
