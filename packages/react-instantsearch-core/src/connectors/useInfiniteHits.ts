import { connectInfiniteHits } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  BaseHit,
  InfiniteHitsConnectorParams,
  InfiniteHitsWidgetDescription,
  InfiniteHitsConnector,
} from 'instantsearch-core';

export type UseInfiniteHitsProps<THit extends BaseHit = BaseHit> =
  InfiniteHitsConnectorParams<THit>;

export function useInfiniteHits<THit extends BaseHit = BaseHit>(
  props?: UseInfiniteHitsProps<THit>,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    InfiniteHitsConnectorParams<THit>,
    InfiniteHitsWidgetDescription<THit>
  >(
    connectInfiniteHits as InfiniteHitsConnector<THit>,
    props,
    additionalWidgetProperties
  );
}
