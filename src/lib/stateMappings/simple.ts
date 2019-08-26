import { UiState, StateMapping } from '../../types';

export type SimpleRouteState = Omit<UiState, 'configure'>;

export default function SimpleStateMapping(): StateMapping<SimpleRouteState> {
  return {
    stateToRoute(uiState: UiState): SimpleRouteState {
      const { configure, ...trackedRouteState } = uiState;
      return trackedRouteState;
    },

    // technically a URL could contain any key, since users provide it,
    // which is why the input to this function is UiState, not RouteState
    routeToState(routeState: UiState): UiState {
      const { configure, ...trackedUiState } = routeState;
      return trackedUiState;
    },
  };
}
