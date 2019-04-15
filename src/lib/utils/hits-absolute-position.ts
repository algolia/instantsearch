import { Hits } from '../../types';

export const addAbsolutePosition = (
  hits: Hits,
  page: number,
  hitsPerPage: number
) => {
  return hits.map((hit, idx) => ({
    ...hit,
    __position: hitsPerPage * page + idx + 1,
  }));
};
