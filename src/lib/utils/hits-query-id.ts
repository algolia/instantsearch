import { Hit } from '../../types';

export function addQueryID<THit = Hit>(
  hits: THit[],
  queryID?: string
): THit[] {
  if (!queryID) {
    return hits;
  }
  return hits.map(hit => ({
    ...hit,
    __queryID: queryID,
  }));
};
