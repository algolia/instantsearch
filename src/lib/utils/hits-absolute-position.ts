import { Hits } from '../../types';

export const addAbsolutePosition = (
  hits: Hits,
  page: number,
  hitsPerPage: number
): Hits => {
  if (hits && hits.length) {
    for (let i = 0, length = hits.length; i < length; i++) {
      hits[i].__position = hitsPerPage * page + i + 1;
    }
  }
  return hits;
};
