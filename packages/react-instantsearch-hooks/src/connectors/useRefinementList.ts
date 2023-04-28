import connectRefinementList from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type { UseParentIndexProps } from '../lib/useParentIndex';
import type {
  RefinementListConnectorParams,
  RefinementListWidgetDescription,
} from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';

export type UseRefinementListProps = RefinementListConnectorParams &
  UseParentIndexProps;

export function useRefinementList(
  props: UseRefinementListProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    RefinementListConnectorParams,
    RefinementListWidgetDescription
  >(connectRefinementList, props, additionalWidgetProperties);
}
