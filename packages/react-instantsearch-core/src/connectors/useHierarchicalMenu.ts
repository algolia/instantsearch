import { connectHierarchicalMenu } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  HierarchicalMenuConnectorParams,
  HierarchicalMenuWidgetDescription,
} from 'instantsearch-core';

export type UseHierarchicalMenuProps = HierarchicalMenuConnectorParams;

export function useHierarchicalMenu(
  props: UseHierarchicalMenuProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    HierarchicalMenuConnectorParams,
    HierarchicalMenuWidgetDescription
  >(connectHierarchicalMenu, props, additionalWidgetProperties);
}
