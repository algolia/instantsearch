import type { StateMapping, IndexUiState, UiState } from '../../types/index.js';

function getIndexStateWithoutConfigure<TIndexUiState extends IndexUiState>(
  uiState: TIndexUiState
): TIndexUiState {
  const { configure, ...trackedUiState } = uiState;
  return trackedUiState as TIndexUiState;
}

export default function singleIndexStateMapping<
  TUiState extends UiState = UiState
>(
  indexName: keyof TUiState
): StateMapping<TUiState, TUiState[typeof indexName]> {
  return {
    stateToRoute(uiState) {
      return getIndexStateWithoutConfigure(uiState[indexName] || {});
    },
    routeToState(routeState = {} as TUiState[typeof indexName]) {
      return {
        [indexName]: getIndexStateWithoutConfigure(routeState),
      } as unknown as TUiState;
    },
  };
}
