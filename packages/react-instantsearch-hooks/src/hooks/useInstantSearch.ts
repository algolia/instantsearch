import { useCallback } from 'react';

import { useInstantSearchContext } from '../lib/useInstantSearchContext';
import { useSearchResults } from '../lib/useSearchResults';
import { useSearchState } from '../lib/useSearchState';

import type { SearchResults } from 'algoliasearch-helper';
import type {
  IndexUiState,
  InstantSearch,
  Middleware,
  ScopedResult,
  UiState,
} from 'instantsearch.js';

type InstantSearchApi = {
  scopedResults: ScopedResult[];
  results: SearchResults<any>;
  uiState: UiState;
  setUiState: InstantSearch['setUiState'];
  indexUiState: IndexUiState;
  setIndexUiState: (indexUiState: IndexUiState) => void;
  use: (...middlewares: Middleware[]) => () => void;
  refresh: InstantSearch['refresh'];
};

export function useInstantSearch(): InstantSearchApi {
  const search = useInstantSearchContext();
  const { uiState, setUiState, indexUiState, setIndexUiState } =
    useSearchState();
  const { results, scopedResults } = useSearchResults();

  const use: InstantSearchApi['use'] = useCallback(
    (...middlewares: Middleware[]) => {
      search.use(...middlewares);

      return () => {
        search.unuse(...middlewares);
      };
    },
    [search]
  );

  const refresh: InstantSearchApi['refresh'] = useCallback(() => {
    search.refresh();
  }, [search]);

  return {
    results,
    scopedResults,
    uiState,
    setUiState,
    indexUiState,
    setIndexUiState,
    use,
    refresh,
  };
}
