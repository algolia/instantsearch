import { useCallback, useEffect, useState } from 'react';

import { useIndexContext } from './useIndexContext';
import { useInstantSearchContext } from './useInstantSearchContext';

import type { UiState } from 'instantsearch.js';

export type SearchStateApi<TUiState extends UiState> = {
  uiState: TUiState;
  setUiState: (
    uiState: TUiState | ((previousUiState: TUiState) => TUiState)
  ) => void;
  indexUiState: TUiState[keyof TUiState];
  setIndexUiState: (
    indexUiState:
      | TUiState[keyof TUiState]
      | ((
          previousIndexUiState: TUiState[keyof TUiState]
        ) => TUiState[keyof TUiState])
  ) => void;
};

export function useSearchState<
  TUiState extends UiState
>(): SearchStateApi<TUiState> {
  const search = useInstantSearchContext<TUiState>();
  const searchIndex = useIndexContext();
  const indexId = searchIndex.getIndexId();
  const [uiState, setLocalUiState] = useState(() => search.getUiState());
  const indexUiState = uiState[indexId] as TUiState[keyof TUiState];

  const setUiState = useCallback<SearchStateApi<TUiState>['setUiState']>(
    (nextUiState) => {
      search.setUiState(nextUiState);
    },
    [search]
  );
  const setIndexUiState = useCallback<
    SearchStateApi<TUiState>['setIndexUiState']
  >(
    (nextUiState) => {
      setUiState((prevUiState) => ({
        ...prevUiState,
        [indexId]:
          typeof nextUiState === 'function'
            ? nextUiState(
                prevUiState[indexId] as unknown as TUiState[keyof TUiState]
              )
            : nextUiState,
      }));
    },
    [setUiState, indexId]
  );

  useEffect(() => {
    function handleRender() {
      setLocalUiState(search.getUiState());
    }

    search.addListener('render', handleRender);

    return () => {
      search.removeListener('render', handleRender);
    };
  }, [search, indexId]);

  return {
    uiState,
    setUiState,
    indexUiState,
    setIndexUiState,
  };
}
