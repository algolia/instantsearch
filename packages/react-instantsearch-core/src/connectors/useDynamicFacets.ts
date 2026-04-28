import connectDynamicFacets from 'instantsearch.js/es/connectors/dynamic-facets/connectDynamicFacets';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  DynamicFacetsConnectorParams,
  DynamicFacetsWidgetDescription,
} from 'instantsearch.js/es/connectors/dynamic-facets/connectDynamicFacets';

export type UseDynamicFacetsProps = DynamicFacetsConnectorParams;

export function useDynamicFacets(
  props: UseDynamicFacetsProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    DynamicFacetsConnectorParams,
    DynamicFacetsWidgetDescription
  >(connectDynamicFacets, props, additionalWidgetProperties);
}
