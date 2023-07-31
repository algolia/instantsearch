import connectStats from 'instantsearch.js/es/connectors/stats/connectStats';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  StatsConnectorParams,
  StatsWidgetDescription,
} from 'instantsearch.js/es/connectors/stats/connectStats';

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
