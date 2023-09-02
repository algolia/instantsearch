import { getInitialResults } from 'instantsearch.js/es/lib/server';
import { walkIndex } from 'instantsearch.js/es/lib/utils';
import { ServerInsertedHTMLContext } from 'next/navigation';
import React, { useContext, useRef } from 'react';
import {
  InstantSearch,
  InstantSearchRSCContext,
  InstantSearchSSRProvider,
  useInstantSearchContext,
  useRSCContext,
  wrapPromiseWithState,
} from 'react-instantsearch-core';

import type { InitialResults, UiState } from 'instantsearch.js';
import type { ReactNode } from 'react';
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

export type NextInstantSearchSSRProps<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
> = {
  children: ReactNode;
} & InstantSearchProps<TUiState, TRouteState>;

export function NextInstantSearchSSR<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
>({
  children,
  ...instantSearchProps
}: NextInstantSearchSSRProps<TUiState, TRouteState>) {
  const promiseRef = useRef<PromiseWithState<void> | null>(null);
  const isServerSide = typeof window === 'undefined';

  let initialResults;
  if (!isServerSide) {
    initialResults = window[InstantSearchInitialResults]?.pop();
  }

  return (
    <InstantSearchRSCContext.Provider value={promiseRef}>
      <InstantSearchSSRProvider initialResults={initialResults}>
        <InstantSearch {...instantSearchProps}>
          {isServerSide && <InitializePromise />}
          {children}
          {isServerSide && <TriggerSearch />}
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

  const waitForRender = () =>
    new Promise<void>((resolve) => {
      search.once('render', () => {
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
      waitForRender()
        .then(() => {
          let shouldRefetch = false;
          walkIndex(search.mainIndex, (index) => {
            shouldRefetch = index
              .getWidgets()
              .some((widget) => widget.$$type === 'ais.dynamicWidgets');
          });

          if (shouldRefetch) {
            waitForResultsRef.current = wrapPromiseWithState(
              // We have to wait for 2 renders, one for the dynamic widgets to be
              // rendered, and one for the results to be received.
              waitForRender().then(waitForRender).then(injectInitialResults)
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
