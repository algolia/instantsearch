import connectFeeds from 'instantsearch.js/es/connectors/feeds/connectFeeds';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  FeedsConnectorParams,
  FeedsWidgetDescription,
} from 'instantsearch.js/es/connectors/feeds/connectFeeds';

export type UseFeedsProps = FeedsConnectorParams;

export function useFeeds(
  props: UseFeedsProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<FeedsConnectorParams, FeedsWidgetDescription>(
    connectFeeds,
    props,
    additionalWidgetProperties
  );
}
