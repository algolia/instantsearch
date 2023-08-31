import React from 'react';
import {
  InstantSearch,
  InstantSearchRSCContext,
  useInstantSearchContext,
  useRSCContext,
} from 'react-instantsearch-core';

import { ServerInsertedHTMLContext } from 'next/navigation';

import type { UiState } from 'instantsearch.js';
import type {
  InstantSearchProps,
  PromiseWithState,
} from 'react-instantsearch-core';

export type NextInstantSearchSSRProps<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
> = {
  children: React.ReactElement;
} & InstantSearchProps<TUiState, TRouteState>;

export function NextInstantSearchSSR<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
>({
  children,
  ...instantSearchProps
}: NextInstantSearchSSRProps<TUiState, TRouteState>) {
  const promiseRef = React.useRef<PromiseWithState<void> | null>(null);
  const insertHTML =
    React.useContext(ServerInsertedHTMLContext) ||
    (() => {
      throw new Error('Missing ServerInsertedHTMLContext');
    });

  return (
    <InstantSearchRSCContext.Provider value={{ promiseRef, insertHTML }}>
      <InstantSearch {...instantSearchProps}>
        {children}
        <TriggerSearch />
      </InstantSearch>
    </InstantSearchRSCContext.Provider>
  );
}

function TriggerSearch() {
  const instantsearch = useInstantSearchContext();
  const { promiseRef } = useRSCContext();

  if (promiseRef.current?.status === 'pending') {
    instantsearch.mainHelper?.searchOnlyWithDerivedHelpers();
  }

  return null;
}
