export function serializePayload(payload: object): string {
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function deserializePayload(payload: string): object {
  return JSON.parse(decodeURIComponent(atob(payload)));
}
