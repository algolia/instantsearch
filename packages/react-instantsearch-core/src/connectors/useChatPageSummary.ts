import connectChatPageSummary from 'instantsearch.js/es/connectors/chat-page-summary/connectChatPageSummary';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ChatPageSummaryConnector,
  ChatPageSummaryConnectorParams,
  ChatPageSummaryWidgetDescription,
} from 'instantsearch.js/es/connectors/chat-page-summary/connectChatPageSummary';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';

export type UseChatPageSummaryProps<
  TUiMessage extends UIMessage = UIMessage
> = ChatPageSummaryConnectorParams<TUiMessage>;

export function useChatPageSummary<TUiMessage extends UIMessage = UIMessage>(
  props: UseChatPageSummaryProps<TUiMessage>,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    ChatPageSummaryConnectorParams<TUiMessage>,
    ChatPageSummaryWidgetDescription<TUiMessage>
  >(
    connectChatPageSummary as unknown as ChatPageSummaryConnector<TUiMessage>,
    props,
    additionalWidgetProperties
  );
}
