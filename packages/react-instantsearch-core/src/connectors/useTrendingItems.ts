import connectTrendingItems from 'instantsearch.js/es/connectors/trending-items/connectTrendingItems';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type { BaseHit } from 'instantsearch.js';
import type {
  TrendingItemsConnector,
  TrendingItemsConnectorParams,
  TrendingItemsWidgetDescription,
} from 'instantsearch.js/es/connectors/trending-items/connectTrendingItems';

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
