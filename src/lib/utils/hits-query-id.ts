import { AlgoliaHit } from '../../types';

export function addQueryID<THit extends AlgoliaHit>(
  hits: THit[],
  queryID?: string
): Array<THit & { __queryID?: string }> {
  if (!queryID) {
    return hits;
  }
  return hits.map(hit => ({
    ...hit,
    __queryID: queryID,
  }));
}
