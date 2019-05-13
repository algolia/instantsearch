import { Hits } from '../../types';

export const addQueryID = (hits: Hits, queryID: string): Hits => {
  if (queryID && hits && hits.length) {
    for (let hit of hits) {
      hit.__queryID = queryID;
    }
  }
  return hits;
};
