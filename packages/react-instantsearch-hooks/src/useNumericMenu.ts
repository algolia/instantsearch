import connectNumericMenu from 'instantsearch.js/es/connectors/numeric-menu/connectNumericMenu';

import { useConnector } from './useConnector';

import type {
  NumericMenuConnectorParams,
  NumericMenuWidgetDescription,
} from 'instantsearch.js/es/connectors/numeric-menu/connectNumericMenu';

export type UseNumericMenuProps = NumericMenuConnectorParams;

export function useNumericMenu(props: UseNumericMenuProps) {
  return useConnector<NumericMenuConnectorParams, NumericMenuWidgetDescription>(
    connectNumericMenu,
    props
  );
}
