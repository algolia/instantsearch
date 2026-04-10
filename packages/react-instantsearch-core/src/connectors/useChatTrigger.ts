import connectChatTrigger from 'instantsearch.js/es/connectors/chat/connectChatTrigger';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ChatTriggerConnectorParams,
  ChatTriggerWidgetDescription,
} from 'instantsearch.js/es/connectors/chat/connectChatTrigger';
import type { Connector } from 'instantsearch.js/es/types';

export type UseChatTriggerProps = ChatTriggerConnectorParams;

type ChatTriggerConnector = Connector<
  ChatTriggerWidgetDescription,
  ChatTriggerConnectorParams
>;

export function useChatTrigger(
  props: UseChatTriggerProps = {},
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<ChatTriggerConnectorParams, ChatTriggerWidgetDescription>(
    connectChatTrigger as unknown as ChatTriggerConnector,
    props,
    additionalWidgetProperties
  );
}
