import connectSortBy from 'instantsearch.js/es/connectors/sort-by/connectSortBy';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  SortByConnectorParams,
  SortByWidgetDescription,
} from 'instantsearch.js/es/connectors/sort-by/connectSortBy';

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
