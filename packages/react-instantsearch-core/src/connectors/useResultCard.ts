import connectResultCard from 'instantsearch.js/es/connectors/result-card/connectResultCard';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ResultCardConnectorParams,
  ResultCardWidgetDescription,
} from 'instantsearch.js/es/connectors/result-card/connectResultCard';

export type UseResultCardProps = ResultCardConnectorParams;

export function useResultCard(
  props: UseResultCardProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<ResultCardConnectorParams, ResultCardWidgetDescription>(
    connectResultCard,
    props,
    additionalWidgetProperties
  );
}
