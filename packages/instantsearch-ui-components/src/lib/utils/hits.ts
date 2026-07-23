export function addAbsolutePosition<THit extends Record<string, any>>(
  hits: THit[],
  page: number,
  hitsPerPage: number
): Array<THit & { __position: number }> {
  return hits.map((hit, idx) => ({
    ...hit,
    __position: hitsPerPage * page + idx + 1,
  }));
}

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
