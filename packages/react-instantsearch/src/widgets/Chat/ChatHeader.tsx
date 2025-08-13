import { createChatHeaderComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  Pragma,
  ChatHeaderProps as ChatHeaderUiProps,
} from 'instantsearch-ui-components';

export type ChatHeaderProps = ChatHeaderUiProps;

const ChatHeaderUiComponent = createChatHeaderComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function ChatHeader(props: ChatHeaderProps) {
  return <ChatHeaderUiComponent {...props} />;
}
