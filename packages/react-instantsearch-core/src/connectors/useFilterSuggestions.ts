import connectFilterSuggestions from 'instantsearch.js/es/connectors/filter-suggestions/connectFilterSuggestions';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  FilterSuggestionsConnectorParams,
  FilterSuggestionsWidgetDescription,
} from 'instantsearch.js/es/connectors/filter-suggestions/connectFilterSuggestions';

export type UseFilterSuggestionsProps = FilterSuggestionsConnectorParams;

export function useFilterSuggestions(
  props: UseFilterSuggestionsProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    FilterSuggestionsConnectorParams,
    FilterSuggestionsWidgetDescription
  >(connectFilterSuggestions, props, additionalWidgetProperties);
}
