import { connectChat } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ChatConnector,
  ChatConnectorParams,
  ChatWidgetDescription,
  UIMessage,
} from 'instantsearch-core';

export type UseChatProps<TUiMessage extends UIMessage = UIMessage> =
  ChatConnectorParams<TUiMessage>;

export function useChat<TUiMessage extends UIMessage = UIMessage>(
  props: UseChatProps<TUiMessage>,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    ChatConnectorParams<TUiMessage>,
    ChatWidgetDescription<TUiMessage>
  >(
    connectChat as unknown as ChatConnector<TUiMessage>,
    props,
    additionalWidgetProperties
  );
}
