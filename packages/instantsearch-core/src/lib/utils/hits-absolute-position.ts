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
