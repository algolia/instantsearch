import { createChatToggleButtonComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useChatTrigger, useInstantSearch } from 'react-instantsearch-core';

import type {
  ChatToggleButtonClassNames,
  ChatToggleButtonProps as ChatToggleButtonUiProps,
  Pragma,
} from 'instantsearch-ui-components';
import type { ChatRenderState } from 'instantsearch.js/es/connectors/chat/connectChat';

const ChatToggleButton = createChatToggleButtonComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export type ChatTriggerProps = {
  /**
   * CSS classes to add to the widget elements.
   */
  classNames?: Partial<ChatToggleButtonClassNames>;

  /**
   * Custom icon component to replace the default sparkles/chevron icons.
   */
  toggleIconComponent?: ChatToggleButtonUiProps['toggleIconComponent'];

  /**
   * Callback when the trigger is clicked.
   */
  onClick?: () => void;
};

export function ChatTrigger({
  classNames,
  toggleIconComponent,
  onClick,
}: ChatTriggerProps) {
  useChatTrigger({}, { $$widgetType: 'ais.chatTrigger' });

  const { indexRenderState } = useInstantSearch();
  const chatState = indexRenderState.chat as
    | Partial<ChatRenderState>
    | undefined;
  const isOpen = chatState?.open ?? false;

  const handleClick = () => {
    chatState?.setOpen?.(!isOpen);
    onClick?.();
  };

  return (
    <ChatToggleButton
      open={isOpen}
      onClick={handleClick}
      classNames={classNames}
      toggleIconComponent={toggleIconComponent}
    />
  );
}
