export function serializePayload(payload: Record<string, unknown>): string {
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function deserializePayload(payload: string): Record<string, unknown> {
  return JSON.parse(decodeURIComponent(atob(payload)));
}
