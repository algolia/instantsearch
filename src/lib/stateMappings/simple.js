class SimpleUIStateMapping {
  stateToRoute(uiState) {
    return uiState;
  }
  routeToState(syncable) {
    return syncable;
  }
}

export default function() {
  return new SimpleUIStateMapping();
}
