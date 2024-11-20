import { connectNumericMenu } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  NumericMenuConnectorParams,
  NumericMenuWidgetDescription,
} from 'instantsearch-core';

export type UseNumericMenuProps = NumericMenuConnectorParams;

export function useNumericMenu(
  props: UseNumericMenuProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<NumericMenuConnectorParams, NumericMenuWidgetDescription>(
    connectNumericMenu,
    props,
    additionalWidgetProperties
  );
}
