import { StateMapping, IndexUiState } from '../../types';

function getIndexStateWithoutConfigure(uiState: IndexUiState): IndexUiState {
  const { configure, ...trackedUiState } = uiState;
  return trackedUiState;
}

export default function singleIndexStateMapping(
  indexName: string
): StateMapping {
  return {
    stateToRoute(uiState) {
      return getIndexStateWithoutConfigure(uiState[indexName] || {});
    },
    routeToState(routeState = {}) {
      return {
        [indexName]: getIndexStateWithoutConfigure(routeState),
      };
    },
  };
}
