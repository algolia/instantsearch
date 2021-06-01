import { AlgoliaHit } from '../../types';

export function addAbsolutePosition<THit extends AlgoliaHit>(
  hits: THit[],
  page: number,
  hitsPerPage: number
): Array<THit & { __position: number }> {
  return hits.map((hit, idx) => ({
    ...hit,
    __position: hitsPerPage * page + idx + 1,
  }));
}
