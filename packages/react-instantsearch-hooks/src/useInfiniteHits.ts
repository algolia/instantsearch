import connectInfiniteHits from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits';

import { useConnector } from './useConnector';

import type {
  InfiniteHitsConnectorParams,
  InfiniteHitsWidgetDescription,
} from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits';

export type UseInfiniteHitsProps = InfiniteHitsConnectorParams;

export function useInfiniteHits(props?: UseInfiniteHitsProps) {
  return useConnector<
    InfiniteHitsConnectorParams,
    InfiniteHitsWidgetDescription
  >(connectInfiniteHits, props);
}
