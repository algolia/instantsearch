import type { TrendingFacetHit as Base } from 'algoliasearch/lite';

export type TrendingFacetHit = Base & {
  __position: number;
  __queryID?: string;
};
