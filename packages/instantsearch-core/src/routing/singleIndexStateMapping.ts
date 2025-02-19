import type { StateMapping, UiState } from '../types';

export function singleIndexStateMapping<TUiState extends UiState = UiState>(
  indexName: keyof TUiState
): StateMapping<TUiState, TUiState[typeof indexName]> {
  return {
    $$type: 'ais.singleIndex',
    stateToRoute(uiState) {
      return uiState[indexName] || {};
    },
    routeToState(routeState = {} as TUiState[typeof indexName]) {
      return {
        [indexName]: routeState,
      } as unknown as TUiState;
    },
  };
}
