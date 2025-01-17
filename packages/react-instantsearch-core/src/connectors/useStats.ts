import { connectStats } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  StatsConnectorParams,
  StatsWidgetDescription,
} from 'instantsearch-core';

export type UseStatsProps = StatsConnectorParams;

export function useStats(
  props?: UseStatsProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<StatsConnectorParams, StatsWidgetDescription>(
    connectStats,
    props,
    additionalWidgetProperties
  );
}
