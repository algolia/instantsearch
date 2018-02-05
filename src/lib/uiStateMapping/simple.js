class SimpleUIStateMapping {
  toSyncable(uiState) {
    return uiState;
  }
  fromSyncable(syncable) {
    return syncable;
  }
}

export default function(...args) {
  return new SimpleUIStateMapping(...args);
}
