import connectCurrentRefinements from 'instantsearch.js/es/connectors/current-refinements/connectCurrentRefinements';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type { UseParentIndexProps } from '../lib/useParentIndex';
import type {
  CurrentRefinementsConnectorParams,
  CurrentRefinementsWidgetDescription,
} from 'instantsearch.js/es/connectors/current-refinements/connectCurrentRefinements';

export type UseCurrentRefinementsProps = CurrentRefinementsConnectorParams &
  UseParentIndexProps;

export function useCurrentRefinements(
  props?: UseCurrentRefinementsProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    CurrentRefinementsConnectorParams,
    CurrentRefinementsWidgetDescription
  >(connectCurrentRefinements, props, additionalWidgetProperties);
}
