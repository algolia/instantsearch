export function addQueryID<THit extends Record<string, any>>(
  hits: THit[],
  queryID?: string
): Array<THit & { __queryID?: string }> {
  if (!queryID) {
    return hits;
  }
  return hits.map((hit) => ({
    ...hit,
    __queryID: queryID,
  }));
}
