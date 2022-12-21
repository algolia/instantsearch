import connectSearchBox from 'instantsearch.js/es/connectors/search-box/connectSearchBox';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  SearchBoxConnectorParams,
  SearchBoxWidgetDescription,
} from 'instantsearch.js/es/connectors/search-box/connectSearchBox';

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
