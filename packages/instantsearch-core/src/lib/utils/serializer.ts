// @MAJOR delete after bindEvent is removed
export function serializePayload<TPayload>(payload: TPayload): string {
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

// @MAJOR delete after bindEvent is removed
export function deserializePayload<TPayload>(serialized: string): TPayload {
  return JSON.parse(decodeURIComponent(atob(serialized)));
}
