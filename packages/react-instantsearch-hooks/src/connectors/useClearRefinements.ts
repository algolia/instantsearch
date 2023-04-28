import connectClearRefinements from 'instantsearch.js/es/connectors/clear-refinements/connectClearRefinements';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type { UseParentIndexProps } from '../lib/useParentIndex';
import type {
  ClearRefinementsConnectorParams,
  ClearRefinementsWidgetDescription,
} from 'instantsearch.js/es/connectors/clear-refinements/connectClearRefinements';

export type UseClearRefinementsProps = ClearRefinementsConnectorParams &
  UseParentIndexProps;

export function useClearRefinements(
  props?: UseClearRefinementsProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    ClearRefinementsConnectorParams,
    ClearRefinementsWidgetDescription
  >(connectClearRefinements, props, additionalWidgetProperties);
}
