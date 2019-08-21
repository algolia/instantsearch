import { UiState, StateMapping } from '../../types';

export type SimpleRouteState = Omit<UiState, 'configure'>;

export default function SimpleStateMapping(): StateMapping<SimpleRouteState> {
  return {
    stateToRoute(uiState: UiState): SimpleRouteState {
      const { configure, ...trackedRouteState } = uiState;
      return trackedRouteState;
    },

    routeToState(routeState: SimpleRouteState): UiState {
      // users can still make a url containing the key "configure", we don't want
      // to take it in account by default.
      const { configure, ...trackedUiState } = routeState as UiState;
      return trackedUiState;
    },
  };
}
