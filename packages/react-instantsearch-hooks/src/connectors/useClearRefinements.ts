import connectClearRefinements from 'instantsearch.js/es/connectors/clear-refinements/connectClearRefinements';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ClearRefinementsConnectorParams,
  ClearRefinementsWidgetDescription,
} from 'instantsearch.js/es/connectors/clear-refinements/connectClearRefinements';

export type UseClearRefinementsProps = ClearRefinementsConnectorParams;

export function useClearRefinements(
  props?: UseClearRefinementsProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    ClearRefinementsConnectorParams,
    ClearRefinementsWidgetDescription
  >(connectClearRefinements, props, additionalWidgetProperties);
}
