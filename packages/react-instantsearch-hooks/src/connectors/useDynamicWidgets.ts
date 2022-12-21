import connectDynamicWidgets from 'instantsearch.js/es/connectors/dynamic-widgets/connectDynamicWidgets';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  DynamicWidgetsConnectorParams,
  DynamicWidgetsWidgetDescription,
} from 'instantsearch.js/es/connectors/dynamic-widgets/connectDynamicWidgets';

export type UseDynamicWidgetsProps = Omit<
  DynamicWidgetsConnectorParams,
  'widgets' | 'fallbackWidget'
>;

export function useDynamicWidgets(
  props?: UseDynamicWidgetsProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    DynamicWidgetsConnectorParams,
    DynamicWidgetsWidgetDescription
  >(
    connectDynamicWidgets,
    {
      ...props,
      // We don't rely on InstantSearch.js for rendering widgets because React
      // directly manipulates the children.
      widgets: [],
    },
    additionalWidgetProperties
  );
}
