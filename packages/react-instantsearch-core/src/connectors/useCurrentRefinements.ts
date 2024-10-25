import { connectCurrentRefinements } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  CurrentRefinementsConnectorParams,
  CurrentRefinementsWidgetDescription,
} from 'instantsearch-core';

export type UseCurrentRefinementsProps = CurrentRefinementsConnectorParams;

export function useCurrentRefinements(
  props?: UseCurrentRefinementsProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    CurrentRefinementsConnectorParams,
    CurrentRefinementsWidgetDescription
  >(connectCurrentRefinements, props, additionalWidgetProperties);
}
