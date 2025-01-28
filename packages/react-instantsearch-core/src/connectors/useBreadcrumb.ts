import { connectBreadcrumb } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  BreadcrumbConnectorParams,
  BreadcrumbWidgetDescription,
} from 'instantsearch-core';

export type UseBreadcrumbProps = BreadcrumbConnectorParams;

export function useBreadcrumb(
  props: UseBreadcrumbProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<BreadcrumbConnectorParams, BreadcrumbWidgetDescription>(
    connectBreadcrumb,
    props,
    additionalWidgetProperties
  );
}
