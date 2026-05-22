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

export type ChatTriggerProps = Omit<
  ChatToggleButtonUiProps,
  'open' | 'onClick'
> & {
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

  /**
   * Whether the button is positioned as a floating action button at the
   * bottom-right of the viewport. Set to `false` to render an inline button
   * that flows with surrounding content.
   * @default true
   */
  floating?: boolean;
};

export function ChatTrigger({
  classNames,
  toggleIconComponent,
  onClick,
  floating = true,
  ...props
}: ChatTriggerProps) {
  const { open, toggleOpen } = useChatTrigger(
    {},
    { $$widgetType: 'ais.chatTrigger' }
  );

  const handleClick = () => {
    toggleOpen();
    onClick?.();
  };

  const rootClassName = [
    floating && 'ais-ChatToggleButton--floating',
    classNames?.root,
  ]
    .filter(Boolean)
    .flat() as string[];

  return (
    <ChatToggleButton
      open={open}
      onClick={handleClick}
      classNames={{ ...classNames, root: rootClassName }}
      toggleIconComponent={toggleIconComponent}
      {...props}
    />
  );
}
