import { connectRange } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  RangeConnectorParams,
  RangeWidgetDescription,
} from 'instantsearch-core';

export type UseRangeProps = RangeConnectorParams;

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
