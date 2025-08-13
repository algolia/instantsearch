import { createChatToggleButtonComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  Pragma,
  ChatToggleButtonProps as ChatToggleButtonUiProps,
} from 'instantsearch-ui-components';

export type ChatToggleButtonProps = ChatToggleButtonUiProps;

const ChatToggleButtonUiComponent = createChatToggleButtonComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function ChatToggleButton(props: ChatToggleButtonProps) {
  return <ChatToggleButtonUiComponent {...props} />;
}
