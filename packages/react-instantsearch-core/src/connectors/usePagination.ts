import { connectPagination } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  PaginationConnectorParams,
  PaginationWidgetDescription,
} from 'instantsearch-core';

export type UsePaginationProps = PaginationConnectorParams;

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
