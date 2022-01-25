import connectBreadcrumb from 'instantsearch.js/es/connectors/breadcrumb/connectBreadcrumb';

import { useConnector } from '../hooks/useConnector';

import type {
  BreadcrumbConnectorParams,
  BreadcrumbWidgetDescription,
} from 'instantsearch.js/es/connectors/breadcrumb/connectBreadcrumb';

export type UseBreadcrumbProps = BreadcrumbConnectorParams;

export function useBreadcrumb(props: UseBreadcrumbProps) {
  return useConnector<BreadcrumbConnectorParams, BreadcrumbWidgetDescription>(
    connectBreadcrumb,
    props
  );
}
