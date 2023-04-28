import connectPagination from 'instantsearch.js/es/connectors/pagination/connectPagination';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type { UseParentIndexProps } from '../lib/useParentIndex';
import type {
  PaginationConnectorParams,
  PaginationWidgetDescription,
} from 'instantsearch.js/es/connectors/pagination/connectPagination';

export type UsePaginationProps = PaginationConnectorParams &
  UseParentIndexProps;

export function usePagination(
  props?: UsePaginationProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<PaginationConnectorParams, PaginationWidgetDescription>(
    connectPagination,
    props,
    additionalWidgetProperties
  );
}
