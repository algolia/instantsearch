import connectChatPageSuggestions from 'instantsearch.js/es/connectors/chat-page-suggestions/connectChatPageSuggestions';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ChatPageSuggestionsConnector,
  ChatPageSuggestionsConnectorParams,
  ChatPageSuggestionsWidgetDescription,
} from 'instantsearch.js/es/connectors/chat-page-suggestions/connectChatPageSuggestions';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';

export type UseChatPageSuggestionsProps<
  TUiMessage extends UIMessage = UIMessage
> = ChatPageSuggestionsConnectorParams<TUiMessage>;

export function useChatPageSuggestions<
  TUiMessage extends UIMessage = UIMessage
>(
  props: UseChatPageSuggestionsProps<TUiMessage>,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    ChatPageSuggestionsConnectorParams<TUiMessage>,
    ChatPageSuggestionsWidgetDescription<TUiMessage>
  >(
    connectChatPageSuggestions as unknown as ChatPageSuggestionsConnector<TUiMessage>,
    props,
    additionalWidgetProperties
  );
}
