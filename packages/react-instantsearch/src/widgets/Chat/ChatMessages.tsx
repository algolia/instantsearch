import { createChatMessagesComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  Pragma,
  ChatMessagesProps as ChatMessagesUiProps,
} from 'instantsearch-ui-components';

export type ChatMessagesProps = ChatMessagesUiProps;

const ChatMessagesUiComponent = createChatMessagesComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function ChatMessages(props: ChatMessagesProps) {
  return <ChatMessagesUiComponent {...props} />;
}

export type {
  ChatMessageBase,
  ChatStatus,
  ChatRole,
} from 'instantsearch-ui-components';
