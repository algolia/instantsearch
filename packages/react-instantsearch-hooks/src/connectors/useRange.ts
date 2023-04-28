import connectRange from 'instantsearch.js/es/connectors/range/connectRange';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type { UseParentIndexProps } from '../lib/useParentIndex';
import type {
  RangeConnectorParams,
  RangeWidgetDescription,
} from 'instantsearch.js/es/connectors/range/connectRange';

export type UseRangeProps = RangeConnectorParams & UseParentIndexProps;

export function useRange(
  props: UseRangeProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<RangeConnectorParams, RangeWidgetDescription>(
    connectRange,
    props,
    additionalWidgetProperties
  );
}
