import connectChat from 'instantsearch.js/es/connectors/chat/connectChat';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ChatConnectorParams,
  ChatWidgetDescription,
} from 'instantsearch.js/es/connectors/chat/connectChat';

export type UseChatProps = ChatConnectorParams;

export function useChat(
  props: UseChatProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<ChatConnectorParams, ChatWidgetDescription>(
    connectChat,
    props,
    additionalWidgetProperties
  );
}
