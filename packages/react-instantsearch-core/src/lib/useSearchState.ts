'use client';

import { useCallback, useEffect, useState } from 'react';

import { useIndexContext } from './useIndexContext';
import { useInstantSearchContext } from './useInstantSearchContext';

import type { InstantSearch, UiState, IndexWidget } from 'instantsearch.js';

export type SearchStateApi<TUiState extends UiState> = {
  uiState: TUiState;
  setUiState: InstantSearch<TUiState>['setUiState'];
  indexUiState: TUiState[string];
  setIndexUiState: IndexWidget<TUiState>['setIndexUiState'];
};

export function useSearchState<
  TUiState extends UiState
>(): SearchStateApi<TUiState> {
  const search = useInstantSearchContext<TUiState>();
  const searchIndex = useIndexContext<TUiState>();
  const indexId = searchIndex.getIndexId();
  const [uiState, setLocalUiState] = useState(() => search.getUiState());
  const indexUiState = uiState[indexId] as TUiState[string];

  const setUiState = useCallback<SearchStateApi<TUiState>['setUiState']>(
    (nextUiState) => {
      search.setUiState(nextUiState);
    },
    [search]
  );
  const setIndexUiState = useCallback<
    SearchStateApi<TUiState>['setIndexUiState']
  >(
    (nextIndexUiState) => {
      searchIndex.setIndexUiState(nextIndexUiState);
    },
    [searchIndex]
  );

  useEffect(() => {
    function handleRender() {
      setLocalUiState(search.getUiState());
    }

    search.addListener('render', handleRender);

    return () => {
      search.removeListener('render', handleRender);
    };
  }, [search]);

  return {
    uiState,
    setUiState,
    indexUiState,
    setIndexUiState,
  };
}
