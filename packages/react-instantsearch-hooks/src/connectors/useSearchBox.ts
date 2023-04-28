import connectSearchBox from 'instantsearch.js/es/connectors/search-box/connectSearchBox';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type { UseParentIndexProps } from '../lib/useParentIndex';
import type {
  SearchBoxConnectorParams,
  SearchBoxWidgetDescription,
} from 'instantsearch.js/es/connectors/search-box/connectSearchBox';

export type UseSearchBoxProps = SearchBoxConnectorParams & UseParentIndexProps;

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
