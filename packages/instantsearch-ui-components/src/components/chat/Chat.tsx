/** @jsx createElement */
/** @jsxFrag Fragment */
import { cx } from '../../lib';

import { createChatHeaderComponent } from './ChatHeader';
import { createChatMessagesComponent } from './ChatMessages';
import { createChatPromptComponent } from './ChatPrompt';
import { createChatToggleButtonComponent } from './ChatToggleButton';

import type { Renderer } from '../../types';
import type { ChatHeaderProps } from './ChatHeader';
import type { ChatMessagesProps } from './ChatMessages';
import type { ChatPromptProps } from './ChatPrompt';
import type { ChatToggleButtonProps } from './ChatToggleButton';

export type ChatClassNames = {
  container?: string | string[];
};

export type ChatProps = {
  open: boolean;
  headerProps: ChatHeaderProps;
  toggleButtonProps: ChatToggleButtonProps;
  messagesProps: ChatMessagesProps;
  promptProps: ChatPromptProps;
  classNames?: Partial<ChatClassNames>;
};

export function createChatComponent({ createElement, Fragment }: Renderer) {
  const ChatToggleButton = createChatToggleButtonComponent({
    createElement,
    Fragment,
  });
  const ChatHeader = createChatHeaderComponent({ createElement, Fragment });
  const ChatMessages = createChatMessagesComponent({ createElement, Fragment });
  const ChatPrompt = createChatPromptComponent({ createElement, Fragment });

  return function Chat({
    open,
    headerProps,
    toggleButtonProps,
    messagesProps,
    promptProps,
    classNames = {},
  }: ChatProps) {
    return (
      <>
        {!open ? (
          <ChatToggleButton {...toggleButtonProps} />
        ) : (
          <div className={cx('ais-Chat-container', classNames.container)}>
            <ChatHeader {...headerProps} />
            <ChatMessages {...messagesProps} />

            <ChatPrompt {...promptProps} />
          </div>
        )}
      </>
    );
  };
}
