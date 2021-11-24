import connectRange from 'instantsearch.js/es/connectors/range/connectRange';

import { useConnector } from './useConnector';

import type {
  RangeConnectorParams,
  RangeWidgetDescription,
} from 'instantsearch.js/es/connectors/range/connectRange';

export type UseRangeProps = RangeConnectorParams;

export function useRange(props: UseRangeProps) {
  return useConnector<RangeConnectorParams, RangeWidgetDescription>(
    connectRange,
    props
  );
}
