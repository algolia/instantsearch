import { createChatPromptComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  Pragma,
  ChatPromptProps as ChatPromptUiProps,
} from 'instantsearch-ui-components';

export type ChatPromptProps = ChatPromptUiProps;

const ChatPromptUiComponent = createChatPromptComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function ChatPrompt(props: ChatPromptProps) {
  return <ChatPromptUiComponent {...props} />;
}
