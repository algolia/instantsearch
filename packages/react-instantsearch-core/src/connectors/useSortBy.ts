import { connectSortBy } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  SortByConnectorParams,
  SortByWidgetDescription,
} from 'instantsearch-core';

export type UseSortByProps = SortByConnectorParams;

export function useSortBy(
  props: UseSortByProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<SortByConnectorParams, SortByWidgetDescription>(
    connectSortBy,
    props,
    additionalWidgetProperties
  );
}
