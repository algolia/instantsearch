import { createChatMessageComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  Pragma,
  ChatMessageProps as ChatMessageUiProps,
} from 'instantsearch-ui-components';

export type ChatMessageProps = ChatMessageUiProps;

const ChatMessageUiComponent = createChatMessageComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function ChatMessage(props: ChatMessageProps) {
  return <ChatMessageUiComponent {...props} />;
}
