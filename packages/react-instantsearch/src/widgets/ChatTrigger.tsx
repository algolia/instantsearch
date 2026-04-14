import { createChatToggleButtonComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useChatTrigger } from 'react-instantsearch-core';

import type {
  ChatToggleButtonClassNames,
  ChatToggleButtonProps as ChatToggleButtonUiProps,
  Pragma,
} from 'instantsearch-ui-components';

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
  const { open, toggleOpen } = useChatTrigger(
    {},
    { $$widgetType: 'ais.chatTrigger' }
  );

  const handleClick = () => {
    toggleOpen();
    onClick?.();
  };

  return (
    <ChatToggleButton
      open={open}
      onClick={handleClick}
      classNames={classNames}
      toggleIconComponent={toggleIconComponent}
    />
  );
}
