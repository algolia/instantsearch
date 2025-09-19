/** @jsx createElement */
/** @jsxFrag Fragment */
import { cx } from '../../lib';

import { createChatHeaderComponent } from './ChatHeader';
import { createChatMessagesComponent } from './ChatMessages';
import { createChatPromptComponent } from './ChatPrompt';
import { createChatToggleButtonComponent } from './ChatToggleButton';

import type { MutableRef, Renderer } from '../../types';
import type { ChatHeaderProps } from './ChatHeader';
import type { ChatMessagesProps } from './ChatMessages';
import type { ChatPromptProps } from './ChatPrompt';
import type { ChatToggleButtonProps } from './ChatToggleButton';

export type ChatClassNames = {
  root?: string | string[];
};

export type ChatProps = {
  /*
   * Whether the chat is open or closed.
   */
  open: boolean;
  /*
   * Whether the chat is maximized or not.
   */
  maximized?: boolean;
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

  const promptRef: MutableRef<HTMLTextAreaElement | null> = { current: null };

  return function Chat({
    open,
    maximized = false,
    headerProps,
    toggleButtonProps,
    messagesProps,
    promptProps = {},
    classNames = {},
  }: ChatProps) {
    return (
      <div className={cx('ais-Chat', maximized && 'ais-Chat--maximized')}>
        <div
          className={cx(
            'ais-Chat-container',
            open && 'ais-Chat-container--open',
            maximized && 'ais-Chat-container--maximized',
            classNames.root
          )}
        >
          <ChatHeader {...headerProps} maximized={maximized} />
          <ChatMessages {...messagesProps} />
          <ChatPrompt {...promptProps} ref={promptRef} />
        </div>

        <ChatToggleButton
          {...toggleButtonProps}
          onClick={() => {
            toggleButtonProps.onClick?.();
            promptRef.current?.focus();
          }}
        />
      </div>
    );
  };
}
