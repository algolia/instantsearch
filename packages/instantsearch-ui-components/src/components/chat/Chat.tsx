/** @jsx createElement */
/** @jsxFrag Fragment */
import { cx } from '../../lib';

import { createChatHeaderComponent } from './ChatHeader';
import { createChatMessagesComponent } from './ChatMessages';
import { createChatPromptComponent } from './ChatPrompt';
import { createChatToggleButtonComponent } from './ChatToggleButton';

import type { Renderer, ComponentProps } from '../../types';
import type { ChatHeaderProps } from './ChatHeader';
import type { ChatMessagesProps } from './ChatMessages';
import type { ChatPromptProps } from './ChatPrompt';
import type { ChatToggleButtonProps } from './ChatToggleButton';

export type ChatClassNames = {
  root?: string | string[];
  container?: string | string[];
  header?: ChatHeaderProps['classNames'];
  messages?: ChatMessagesProps['classNames'];
  prompt?: ChatPromptProps['classNames'];
  toggleButton?: ChatToggleButtonProps['classNames'];
};

export type ChatProps = Omit<ComponentProps<'div'>, 'onError' | 'title'> & {
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
  /**
   * Optional title for the chat
   */
  title?: string;
  /**
   * Optional header component for the chat
   */
  headerComponent?: (props: ChatHeaderProps) => JSX.Element;
  /**
   * Optional prompt component for the chat
   */
  promptComponent?: (props: ChatPromptProps) => JSX.Element;
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
    maximized = false,
    headerProps,
    toggleButtonProps,
    messagesProps,
    promptProps = {},
    headerComponent: HeaderComponent,
    promptComponent: PromptComponent,
    classNames = {},
    className,
    ...props
  }: ChatProps) {
    return (
      <div
        {...props}
        className={cx(
          'ais-Chat',
          maximized && 'ais-Chat--maximized',
          classNames.root,
          className
        )}
      >
        <div
          className={cx(
            'ais-Chat-container',
            open && 'ais-Chat-container--open',
            maximized && 'ais-Chat-container--maximized',
            classNames.container
          )}
        >
          {HeaderComponent ? (
            <HeaderComponent
              {...headerProps}
              classNames={classNames.header}
              maximized={maximized}
            />
          ) : (
            <ChatHeader
              {...headerProps}
              classNames={classNames.header}
              maximized={maximized}
            />
          )}
          <ChatMessages {...messagesProps} classNames={classNames.messages} />
          {PromptComponent ? (
            <PromptComponent {...promptProps} classNames={classNames.prompt} />
          ) : (
            <ChatPrompt {...promptProps} classNames={classNames.prompt} />
          )}
        </div>

        <ChatToggleButton
          {...toggleButtonProps}
          classNames={classNames.toggleButton}
          onClick={() => {
            toggleButtonProps.onClick?.();
            if (!open) {
              promptProps.promptRef?.current?.focus();
            }
          }}
        />
      </div>
    );
  };
}
