import React from 'react';

import { IndexContext } from '../lib/IndexContext';
import { InstantSearchContext } from '../lib/InstantSearchContext';
import { useInstantSearchApi } from '../lib/useInstantSearchApi';
import { useInstantSearchContext } from '../lib/useInstantSearchContext';

import { useRSCContext } from './InstantSearchWrapper';

import type { UseInstantSearchApiProps } from '../lib/useInstantSearchApi';
import type {
  InstantSearch as InstantSearchType,
  UiState,
} from 'instantsearch.js';

export type InstantSearchProps<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
> = UseInstantSearchApiProps<TUiState, TRouteState> & {
  children?: React.ReactNode;
};

export function InstantSearch<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
>({ children, ...props }: InstantSearchProps<TUiState, TRouteState>) {
  const search = useInstantSearchApi<TUiState, TRouteState>(props);

  if (!search.started) {
    return null;
  }

  return (
    <InstantSearchContext.Provider
      value={search as unknown as InstantSearchType<UiState, UiState>}
    >
      <IndexContext.Provider value={search.mainIndex}>
        {children}
        <TriggerSearch />
      </IndexContext.Provider>
    </InstantSearchContext.Provider>
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
