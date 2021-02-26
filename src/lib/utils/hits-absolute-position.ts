import { Hit } from '../../types';

export const addAbsolutePosition = <THit = Hit>(
  hits: THit[],
  page: number,
  hitsPerPage: number
): THit[] => {
  return hits.map((hit, idx) => ({
    ...hit,
    __position: hitsPerPage * page + idx + 1,
  }));
};
