import { connectConfigure } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ConfigureConnectorParams,
  ConfigureWidgetDescription,
} from 'instantsearch-core';

export type UseConfigureProps = ConfigureConnectorParams['searchParameters'];

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
