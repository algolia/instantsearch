import type { UiState, IndexUiState, StateMapping } from '../../types';

function getIndexStateWithoutConfigure<TIndexUiState extends IndexUiState>(
  uiState: TIndexUiState
): Omit<TIndexUiState, 'configure'> {
  const { configure, ...trackedUiState } = uiState;
  return trackedUiState;
}

// technically a URL could contain any key, since users provide it,
// which is why the input to this function is UiState, not something
// which excludes "configure" as this function does.
export default function simpleStateMapping<
  TUiState extends UiState = UiState
>(): StateMapping<TUiState, TUiState> {
  return {
    $$type: 'ais.simple',

    stateToRoute(uiState) {
      return Object.keys(uiState).reduce(
        (state, indexId) => ({
          ...state,
          [indexId]: getIndexStateWithoutConfigure(uiState[indexId]),
        }),
        {} as TUiState
      );
    },

    routeToState(routeState = {} as TUiState) {
      return Object.keys(routeState).reduce(
        (state, indexId) => ({
          ...state,
          [indexId]: getIndexStateWithoutConfigure(routeState[indexId]),
        }),
        {} as TUiState
      );
    },
  };
}
