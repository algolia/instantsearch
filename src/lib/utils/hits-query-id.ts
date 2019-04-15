import { Hits } from '../../types';

export const addQueryID = (hits: Hits, queryID: string) => {
  if (!queryID) {
    return hits;
  }
  return hits.map(hit => ({
    ...hit,
    __queryID: queryID,
  }));
};
