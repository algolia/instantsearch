import { UiState, IndexUiState, StateMapping } from '../../types';

function getIndexStateWithoutConfigure(uiState: IndexUiState): IndexUiState {
  const { configure, ...trackedUiState } = uiState;
  return trackedUiState;
}

// technically a URL could contain any key, since users provide it,
// which is why the input to this function is UiState, not something
// which excludes "configure" as this function does.
export default function simpleStateMapping(): StateMapping<UiState> {
  return {
    stateToRoute(uiState) {
      return Object.keys(uiState).reduce<UiState>(
        (state, indexId) => ({
          ...state,
          [indexId]: getIndexStateWithoutConfigure(uiState[indexId]),
        }),
        {}
      );
    },

    routeToState(routeState = {}) {
      return Object.keys(routeState).reduce<UiState>(
        (state, indexId) => ({
          ...state,
          [indexId]: getIndexStateWithoutConfigure(routeState[indexId]),
        }),
        {}
      );
    },
  };
}
