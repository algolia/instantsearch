import type { AlgoliaHit } from '../../types';

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

// Merged Recommend hits already carry their own response's queryID.
export function addMissingQueryID<THit extends AlgoliaHit>(
  hits: Array<THit & { __queryID?: string }>,
  queryID?: string
): Array<THit & { __queryID?: string }> {
  if (!queryID) {
    return hits;
  }
  return hits.map((hit) =>
    hit.__queryID ? hit : { ...hit, __queryID: queryID }
  );
}
