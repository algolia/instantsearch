import connectChatTrigger from 'instantsearch.js/es/connectors/chat/connectChatTrigger';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ChatTriggerConnectorParams,
  ChatTriggerWidgetDescription,
} from 'instantsearch.js/es/connectors/chat/connectChatTrigger';

export type UseChatTriggerProps = ChatTriggerConnectorParams;

export function useChatTrigger(
  props: UseChatTriggerProps = {},
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<ChatTriggerConnectorParams, ChatTriggerWidgetDescription>(
    connectChatTrigger,
    props,
    additionalWidgetProperties
  );
}
