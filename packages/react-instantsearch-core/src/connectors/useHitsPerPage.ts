import { connectHitsPerPage } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  HitsPerPageConnectorParams,
  HitsPerPageWidgetDescription,
} from 'instantsearch-core';

export type UseHitsPerPageProps = HitsPerPageConnectorParams;

export function useHitsPerPage(
  props: UseHitsPerPageProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<HitsPerPageConnectorParams, HitsPerPageWidgetDescription>(
    connectHitsPerPage,
    props,
    additionalWidgetProperties
  );
}
