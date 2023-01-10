import type {
  StatsConnectorParams,
  StatsWidgetDescription,
} from 'instantsearch.js/es/connectors/stats/connectStats';
import connectStats from 'instantsearch.js/es/connectors/stats/connectStats';
import {
  AdditionalWidgetProperties,
  useConnector,
} from '../hooks/useConnector';

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
