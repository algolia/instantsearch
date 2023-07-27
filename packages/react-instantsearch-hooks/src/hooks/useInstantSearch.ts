import { useCallback } from 'react';

import { useInstantSearchContext } from '../lib/useInstantSearchContext';
import { useIsomorphicLayoutEffect } from '../lib/useIsomorphicLayoutEffect';
import { useSearchResults } from '../lib/useSearchResults';
import { useSearchState } from '../lib/useSearchState';

import type { SearchResultsApi } from '../lib/useSearchResults';
import type { SearchStateApi } from '../lib/useSearchState';
import type { InstantSearch, Middleware, UiState } from 'instantsearch.js';

export type InstantSearchApi<TUiState extends UiState = UiState> =
  SearchStateApi<TUiState> &
    SearchResultsApi & {
      /**
       * Adds middlewares to InstantSearch. It returns its own cleanup function.
       */
      addMiddlewares: (...middlewares: Middleware[]) => () => void;
      /**
       * Clears the search client’s cache and performs a new search.
       *
       * This is useful to update the results once an indexing operation has finished.
       */
      refresh: InstantSearch['refresh'];
      /**
       * The status of the search happening.
       */
      status: InstantSearch['status'];
      /**
       * The error that occurred during the search.
       *
       * This is only valid when status is 'error'.
       */
      error: InstantSearch['error'];
    };

export type UseInstantSearchProps = {
  /**
   * catch any error happening in the search lifecycle and handle it with this hook.
   */
  catchError?: boolean;
};

export function useInstantSearch<TUiState extends UiState = UiState>({
  catchError,
}: UseInstantSearchProps = {}): InstantSearchApi<TUiState> {
  const search = useInstantSearchContext<TUiState>();
  const { uiState, setUiState, indexUiState, setIndexUiState } =
    useSearchState<TUiState>();
  const { results, scopedResults } = useSearchResults();

  const addMiddlewares: InstantSearchApi<TUiState>['addMiddlewares'] =
    useCallback(
      (...middlewares: Middleware[]) => {
        search.use(...middlewares);

        return () => {
          search.unuse(...middlewares);
        };
      },
      [search]
    );

  const refresh: InstantSearchApi<TUiState>['refresh'] = useCallback(() => {
    search.refresh();
  }, [search]);

  useIsomorphicLayoutEffect(() => {
    if (catchError) {
      const onError = () => {};
      search.addListener('error', onError);
      return () => search.removeListener('error', onError);
    }
    return () => {};
  }, [search, catchError]);

  return {
    results,
    scopedResults,
    uiState,
    setUiState,
    indexUiState,
    setIndexUiState,
    addMiddlewares,
    refresh,
    status: search.status,
    error: search.error,
  };
}
