import { connectChatTrigger } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ChatTriggerConnectorParams,
  ChatTriggerWidgetDescription,
} from 'instantsearch-core';

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
