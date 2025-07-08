import connectTrendingFacets from 'instantsearch.js/es/connectors/trending-facets/connectTrendingFacets';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  TrendingFacetsConnector,
  TrendingFacetsConnectorParams,
  TrendingFacetsWidgetDescription,
} from 'instantsearch.js/es/connectors/trending-facets/connectTrendingFacets';

export type UseTrendingFacetsProps = TrendingFacetsConnectorParams;

export function useTrendingFacets(
  props?: UseTrendingFacetsProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    TrendingFacetsConnectorParams,
    TrendingFacetsWidgetDescription
  >(
    connectTrendingFacets as TrendingFacetsConnector,
    props,
    additionalWidgetProperties
  );
}
