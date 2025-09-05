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
  /*
   * Whether the chat is open or closed.
   */
  open: boolean;
  /*
   * Props for the ChatHeader component.
   */
  headerProps: ChatHeaderProps;
  /*
   * Props for the ChatToggleButton component.
   */
  toggleButtonProps: ChatToggleButtonProps;
  /*
   * Props for the ChatMessages component.
   */
  messagesProps: ChatMessagesProps;
  /*
   * Props for the ChatPrompt component.
   */
  promptProps: ChatPromptProps;
  /**
   * Optional class names for elements
   */
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
