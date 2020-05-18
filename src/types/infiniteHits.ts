import { SearchParameters } from 'algoliasearch-helper';
import { Hits } from './';

export type InfiniteHitsCachedHits = {
  [page: number]: Hits;
};

type Read = ({
  state,
}: {
  state: Partial<SearchParameters>;
}) => InfiniteHitsCachedHits | null;

type Write = ({
  state,
  hits,
}: {
  state: Partial<SearchParameters>;
  hits: InfiniteHitsCachedHits;
}) => void;

export type InfiniteHitsCache = {
  read: Read;
  write: Write;
};
