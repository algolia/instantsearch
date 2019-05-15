import { UiState, RouteState, StateMapping } from '../../types';

class SimpleUIStateMapping implements StateMapping {
  public stateToRoute(uiState: UiState): RouteState {
    return uiState;
  }

  public routeToState(routeState: RouteState): UiState {
    return routeState;
  }
}

export default function(): SimpleUIStateMapping {
  return new SimpleUIStateMapping();
}
