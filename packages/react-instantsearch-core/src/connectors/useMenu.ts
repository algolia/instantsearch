import { connectMenu } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  MenuConnectorParams,
  MenuWidgetDescription,
} from 'instantsearch-core';

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
