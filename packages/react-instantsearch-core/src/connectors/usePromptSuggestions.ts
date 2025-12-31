import connectPromptSuggestions from 'instantsearch.js/es/connectors/prompt-suggestions/connectPromptSuggestions';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  PromptSuggestionsConnectorParams,
  PromptSuggestionsWidgetDescription,
} from 'instantsearch.js/es/connectors/prompt-suggestions/connectPromptSuggestions';

export type UsePromptSuggestionsProps = PromptSuggestionsConnectorParams;

export function usePromptSuggestions(
  props: UsePromptSuggestionsProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    PromptSuggestionsConnectorParams,
    PromptSuggestionsWidgetDescription
  >(connectPromptSuggestions, props, additionalWidgetProperties);
}
