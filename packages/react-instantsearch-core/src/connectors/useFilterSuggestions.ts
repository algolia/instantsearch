import { connectFilterSuggestions } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  FilterSuggestionsConnectorParams,
  FilterSuggestionsWidgetDescription,
} from 'instantsearch-core';

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
