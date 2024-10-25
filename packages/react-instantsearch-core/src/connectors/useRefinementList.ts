import { connectRefinementList } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  RefinementListConnectorParams,
  RefinementListWidgetDescription,
} from 'instantsearch-core';

export type UseRefinementListProps = RefinementListConnectorParams;

export function useRefinementList(
  props: UseRefinementListProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    RefinementListConnectorParams,
    RefinementListWidgetDescription
  >(connectRefinementList, props, additionalWidgetProperties);
}
