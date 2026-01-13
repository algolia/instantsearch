import connectRefinementSuggestions from 'instantsearch.js/es/connectors/refinement-suggestions/connectRefinementSuggestions';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  RefinementSuggestionsConnectorParams,
  RefinementSuggestionsWidgetDescription,
} from 'instantsearch.js/es/connectors/refinement-suggestions/connectRefinementSuggestions';

export type UseRefinementSuggestionsProps = RefinementSuggestionsConnectorParams;

export function useRefinementSuggestions(
  props: UseRefinementSuggestionsProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    RefinementSuggestionsConnectorParams,
    RefinementSuggestionsWidgetDescription
  >(connectRefinementSuggestions, props, additionalWidgetProperties);
}

