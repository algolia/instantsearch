import connectNumericMenu from 'instantsearch.js/es/connectors/numeric-menu/connectNumericMenu';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type { UseParentIndexProps } from '../lib/useParentIndex';
import type {
  NumericMenuConnectorParams,
  NumericMenuWidgetDescription,
} from 'instantsearch.js/es/connectors/numeric-menu/connectNumericMenu';

export type UseNumericMenuProps = NumericMenuConnectorParams &
  UseParentIndexProps;

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
