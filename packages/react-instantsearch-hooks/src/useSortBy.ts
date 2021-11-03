import connectSortBy from 'instantsearch.js/es/connectors/sort-by/connectSortBy';

import { useConnector } from './useConnector';

import type {
  SortByConnectorParams,
  SortByWidgetDescription,
} from 'instantsearch.js/es/connectors/sort-by/connectSortBy';

export type UseSortByProps = SortByConnectorParams;

export function useSortBy(props: UseSortByProps) {
  return useConnector<SortByConnectorParams, SortByWidgetDescription>(
    connectSortBy,
    props
  );
}
