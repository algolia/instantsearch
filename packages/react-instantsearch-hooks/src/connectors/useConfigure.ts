import connectConfigure from 'instantsearch.js/es/connectors/configure/connectConfigure';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type { UseParentIndexProps } from '../lib/useParentIndex';
import type {
  ConfigureConnectorParams,
  ConfigureWidgetDescription,
} from 'instantsearch.js/es/connectors/configure/connectConfigure';

export type UseConfigureProps = ConfigureConnectorParams['searchParameters'] &
  UseParentIndexProps;

export function useConfigure(
  props: UseConfigureProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<ConfigureConnectorParams, ConfigureWidgetDescription>(
    connectConfigure,
    { searchParameters: props },
    additionalWidgetProperties
  );
}
