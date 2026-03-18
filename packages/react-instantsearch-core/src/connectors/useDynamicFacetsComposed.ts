import connectDynamicFacetsComposed from 'instantsearch.js/es/connectors/dynamic-facets-composed/connectDynamicFacetsComposed';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  DynamicFacetsComposedConnectorParams,
  DynamicFacetsComposedWidgetDescription,
} from 'instantsearch.js/es/connectors/dynamic-facets-composed/connectDynamicFacetsComposed';

export type UseDynamicFacetsComposedProps =
  DynamicFacetsComposedConnectorParams;

export function useDynamicFacetsComposed(
  props: UseDynamicFacetsComposedProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    DynamicFacetsComposedConnectorParams,
    DynamicFacetsComposedWidgetDescription
  >(connectDynamicFacetsComposed, props, additionalWidgetProperties);
}
