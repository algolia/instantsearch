import React from 'react';

import { IndexContext } from '../lib/IndexContext';
import { InstantSearchContext } from '../lib/InstantSearchContext';
import { useInstantSearch } from '../lib/useInstantSearch';

import type { UseInstantSearchProps } from '../lib/useInstantSearch';
import type { UiState } from 'instantsearch.js';

export type InstantSearchProps<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
> = UseInstantSearchProps<TUiState, TRouteState> & {
  children?: React.ReactNode;
};

export function InstantSearch<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
>({ children, ...props }: InstantSearchProps<TUiState, TRouteState>) {
  const search = useInstantSearch<TUiState, TRouteState>(props);

  if (!search.started) {
    return null;
  }

  return (
    <InstantSearchContext.Provider value={search}>
      <IndexContext.Provider value={search.mainIndex}>
        {children}
      </IndexContext.Provider>
    </InstantSearchContext.Provider>
  );
}
