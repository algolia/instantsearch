import { connectClearRefinements } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ClearRefinementsConnectorParams,
  ClearRefinementsWidgetDescription,
} from 'instantsearch-core';

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
