import type { UiState, StateMapping } from '../../types';

export default function simpleStateMapping<
  TUiState extends UiState = UiState,
>(): StateMapping<TUiState, TUiState> {
  return {
    $$type: 'ais.simple',

    stateToRoute(uiState) {
      return uiState;
    },

    routeToState(routeState = {} as TUiState) {
      return Object.keys(routeState).reduce((state, indexId) => {
        const indexState = routeState[indexId];
        if (typeof indexState !== 'object' || indexState === null) {
          return state;
        }
        return {
          ...state,
          [indexId]: indexState,
        };
      }, {} as TUiState);
    },
  };
}
