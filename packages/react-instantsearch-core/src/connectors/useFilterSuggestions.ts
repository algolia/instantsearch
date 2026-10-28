import { connectFilterSuggestions as connectFilterSuggestions } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  FilterSuggestionsConnectorParams,
  FilterSuggestionsWidgetDescription,
} from 'instantsearch-core';

export type UseFilterSuggestionsProps = FilterSuggestionsConnectorParams;

/**
 * @deprecated Filter suggestions are deprecated and will be removed in a future major version.
 */
export function useFilterSuggestions(
  props: UseFilterSuggestionsProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    FilterSuggestionsConnectorParams,
    FilterSuggestionsWidgetDescription
  >(connectFilterSuggestions, props, additionalWidgetProperties);
}
