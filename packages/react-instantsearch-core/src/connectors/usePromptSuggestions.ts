import connectPromptSuggestions from 'instantsearch.js/es/connectors/prompt-suggestions/connectPromptSuggestions';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  PromptSuggestionsConnector,
  PromptSuggestionsConnectorParams,
  PromptSuggestionsWidgetDescription,
} from 'instantsearch.js/es/connectors/prompt-suggestions/connectPromptSuggestions';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';

export type UsePromptSuggestionsProps<
  TUiMessage extends UIMessage = UIMessage
> = PromptSuggestionsConnectorParams<TUiMessage>;

export function usePromptSuggestions<TUiMessage extends UIMessage = UIMessage>(
  props: UsePromptSuggestionsProps<TUiMessage>,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    PromptSuggestionsConnectorParams<TUiMessage>,
    PromptSuggestionsWidgetDescription<TUiMessage>
  >(
    connectPromptSuggestions as unknown as PromptSuggestionsConnector<TUiMessage>,
    props,
    additionalWidgetProperties
  );
}
