import { StateMapping, IndexUiState } from '../../types';

function getIndexStateWithoutConfigure(uiState: IndexUiState): IndexUiState {
  const { configure, ...trackedUiState } = uiState;
  return trackedUiState;
}

export default function singleIndexStateMapping(
  rootIndexName: string
): StateMapping<IndexUiState> {
  return {
    stateToRoute(uiState) {
      return getIndexStateWithoutConfigure(uiState[rootIndexName]);
    },
    routeToState(routeState) {
      return {
        [rootIndexName]: getIndexStateWithoutConfigure(routeState),
      };
    },
  };
}
