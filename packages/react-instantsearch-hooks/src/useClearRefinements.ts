import connectClearRefinements from 'instantsearch.js/es/connectors/clear-refinements/connectClearRefinements';

import { useConnector } from './useConnector';

import type {
  ClearRefinementsConnectorParams,
  ClearRefinementsWidgetDescription,
} from 'instantsearch.js/es/connectors/clear-refinements/connectClearRefinements';

export type UseClearRefinementsProps = ClearRefinementsConnectorParams;

export function useClearRefinements(props?: UseClearRefinementsProps) {
  return useConnector<
    ClearRefinementsConnectorParams,
    ClearRefinementsWidgetDescription
  >(connectClearRefinements, props);
}
