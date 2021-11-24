import connectMenu from 'instantsearch.js/es/connectors/menu/connectMenu';

import { useConnector } from './useConnector';

import type {
  MenuConnectorParams,
  MenuWidgetDescription,
} from 'instantsearch.js/es/connectors/menu/connectMenu';

export type UseMenuProps = MenuConnectorParams;

export function useMenu(props: UseMenuProps) {
  return useConnector<MenuConnectorParams, MenuWidgetDescription>(
    connectMenu,
    props
  );
}
