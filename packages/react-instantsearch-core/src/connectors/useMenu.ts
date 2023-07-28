import connectMenu from 'instantsearch.js/es/connectors/menu/connectMenu';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  MenuConnectorParams,
  MenuWidgetDescription,
} from 'instantsearch.js/es/connectors/menu/connectMenu';

export type UseMenuProps = MenuConnectorParams;

export function useMenu(
  props: UseMenuProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<MenuConnectorParams, MenuWidgetDescription>(
    connectMenu,
    props,
    additionalWidgetProperties
  );
}
