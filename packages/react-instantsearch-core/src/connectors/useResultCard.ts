import { connectResultCard } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ResultCardConnectorParams,
  ResultCardWidgetDescription,
} from 'instantsearch-core';

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
