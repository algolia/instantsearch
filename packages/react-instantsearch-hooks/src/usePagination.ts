import connectPagination from 'instantsearch.js/es/connectors/pagination/connectPagination';

import { useConnector } from './useConnector';

import type {
  PaginationConnectorParams,
  PaginationWidgetDescription,
} from 'instantsearch.js/es/connectors/pagination/connectPagination';

export type UsePaginationProps = PaginationConnectorParams;

export function usePagination(props?: UsePaginationProps) {
  return useConnector<PaginationConnectorParams, PaginationWidgetDescription>(
    connectPagination,
    props
  );
}
