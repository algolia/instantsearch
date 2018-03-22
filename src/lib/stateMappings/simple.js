class SimpleUIStateMapping {
  stateToRoute(uiState) {
    return uiState;
  }
  routeToState(syncable) {
    return syncable;
  }
}

export default function(...args) {
  return new SimpleUIStateMapping(...args);
}
