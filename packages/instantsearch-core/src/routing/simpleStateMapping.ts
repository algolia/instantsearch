import type { UiState, StateMapping } from '../types';

export function simpleStateMapping<
  TUiState extends UiState = UiState
>(): StateMapping<TUiState, TUiState> {
  return {
    $$type: 'ais.simple',

    stateToRoute(uiState) {
      return uiState;
    },

    routeToState(routeState = {} as TUiState) {
      return routeState;
    },
  };
}
