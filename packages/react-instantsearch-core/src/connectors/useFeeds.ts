import { connectFeeds as connectFeeds } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  FeedsConnectorParams,
  FeedsWidgetDescription,
} from 'instantsearch-core';

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
