class SimpleUIStateMapping {
  stateToRoute(uiState) {
    return uiState;
  }
  routeToState(routeState) {
    return routeState;
  }
}

export default function() {
  return new SimpleUIStateMapping();
}
