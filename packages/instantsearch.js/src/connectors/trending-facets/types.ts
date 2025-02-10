import type { TrendingFacetHit as Base } from 'algoliasearch';

export type TrendingFacetHit = Base & {
  __position: number;
  __queryID?: string;
};
