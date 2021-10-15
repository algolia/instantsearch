import connectRefinementList from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';

import { useConnector } from './useConnector';

import type {
  RefinementListConnectorParams,
  RefinementListWidgetDescription,
} from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';

export type UseRefinementListProps = RefinementListConnectorParams;

export function useRefinementList(props: UseRefinementListProps) {
  return useConnector<
    RefinementListConnectorParams,
    RefinementListWidgetDescription
  >(connectRefinementList, props);
}
