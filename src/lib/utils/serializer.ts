export function serializePayload<TPayload>(payload: TPayload): string {
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function deserializePayload<TPayload>(serialized: string): TPayload {
  return JSON.parse(decodeURIComponent(atob(serialized)));
}
