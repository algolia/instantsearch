import connectNumericMenu from 'instantsearch.js/es/connectors/numeric-menu/connectNumericMenu';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  NumericMenuConnectorParams,
  NumericMenuWidgetDescription,
} from 'instantsearch.js/es/connectors/numeric-menu/connectNumericMenu';

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
