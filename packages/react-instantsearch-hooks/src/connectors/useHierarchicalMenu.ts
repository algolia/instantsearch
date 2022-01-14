import connectHierarchicalMenu from 'instantsearch.js/es/connectors/hierarchical-menu/connectHierarchicalMenu';

import { useConnector } from '../hooks/useConnector';

import type {
  HierarchicalMenuConnectorParams,
  HierarchicalMenuWidgetDescription,
} from 'instantsearch.js/es/connectors/hierarchical-menu/connectHierarchicalMenu';

export type UseHierarchicalMenuProps = HierarchicalMenuConnectorParams;

export function useHierarchicalMenu(props: UseHierarchicalMenuProps) {
  return useConnector<
    HierarchicalMenuConnectorParams,
    HierarchicalMenuWidgetDescription
  >(connectHierarchicalMenu, props);
}
