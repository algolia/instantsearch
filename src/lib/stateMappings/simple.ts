import { UiState, StateMapping } from '../../types';

// technically a URL could contain any key, since users provide it,
// which is why the input to this function is UiState, not something
// which excludes "configure" as this function does.
export default function SimpleStateMapping(): StateMapping<UiState> {
  return {
    stateToRoute(uiState) {
      const { configure, ...trackedRouteState } = uiState;
      return trackedRouteState;
    },

    routeToState(routeState) {
      const { configure, ...trackedUiState } = routeState;
      return trackedUiState;
    },
  };
}
