import connectOnPageSuggestions from 'instantsearch.js/es/connectors/on-page-suggestions/connectOnPageSuggestions';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  OnPageSuggestionsConnectorParams,
  OnPageSuggestionsWidgetDescription,
} from 'instantsearch.js/es/connectors/on-page-suggestions/connectOnPageSuggestions';

export type UseOnPageSuggestionsProps = OnPageSuggestionsConnectorParams;

export function useOnPageSuggestions(
  props: UseOnPageSuggestionsProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    OnPageSuggestionsConnectorParams,
    OnPageSuggestionsWidgetDescription
  >(connectOnPageSuggestions, props, additionalWidgetProperties);
}
