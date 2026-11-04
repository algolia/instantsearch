import type { AlgoliaHit } from '../../types';

export function addQueryID<THit extends AlgoliaHit>(
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

/**
 * Recommend widgets with several objectIDs get one response per objectID,
 * merged by the helper. Each merged hit already carries the queryID of its
 * own response, so only hits without one fall back to `queryID`.
 */
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
