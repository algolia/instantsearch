import connectChatPageSuggestions from 'instantsearch.js/es/connectors/chat-page-suggestions/connectChatPageSuggestions';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ChatPageSuggestionsConnectorParams,
  ChatPageSuggestionsWidgetDescription,
} from 'instantsearch.js/es/connectors/chat-page-suggestions/connectChatPageSuggestions';

export type UseChatPageSuggestionsProps = ChatPageSuggestionsConnectorParams;

export function useChatPageSuggestions(
  props: UseChatPageSuggestionsProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    ChatPageSuggestionsConnectorParams,
    ChatPageSuggestionsWidgetDescription
  >(connectChatPageSuggestions, props, additionalWidgetProperties);
}
