import connectSearchBox from 'instantsearch.js/es/connectors/search-box/connectSearchBox';

import { useConnector } from './useConnector';

import type {
  SearchBoxConnectorParams,
  SearchBoxWidgetDescription,
} from 'instantsearch.js/es/connectors/search-box/connectSearchBox';

export type UseSearchBoxProps = SearchBoxConnectorParams;

export function useSearchBox(props?: UseSearchBoxProps) {
  return useConnector<SearchBoxConnectorParams, SearchBoxWidgetDescription>(
    connectSearchBox,
    props
  );
}
