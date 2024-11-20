import { connectTrendingItems } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  BaseHit,
  TrendingItemsConnector,
  TrendingItemsConnectorParams,
  TrendingItemsWidgetDescription,
} from 'instantsearch-core';

export type UseTrendingItemsProps<THit extends BaseHit = BaseHit> =
  TrendingItemsConnectorParams<THit>;

export function useTrendingItems<THit extends BaseHit = BaseHit>(
  props?: UseTrendingItemsProps<THit>,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    TrendingItemsConnectorParams<THit>,
    TrendingItemsWidgetDescription<THit>
  >(
    connectTrendingItems as TrendingItemsConnector<THit>,
    props,
    additionalWidgetProperties
  );
}
