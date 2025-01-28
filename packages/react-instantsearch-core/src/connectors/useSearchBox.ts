import { connectSearchBox } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  SearchBoxConnectorParams,
  SearchBoxWidgetDescription,
} from 'instantsearch-core';

export type UseSearchBoxProps = SearchBoxConnectorParams;

export function useSearchBox(
  props?: UseSearchBoxProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<SearchBoxConnectorParams, SearchBoxWidgetDescription>(
    connectSearchBox,
    props,
    additionalWidgetProperties
  );
}
