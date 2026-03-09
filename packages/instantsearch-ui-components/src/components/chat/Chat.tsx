/** @jsx createElement */
/** @jsxFrag Fragment */
import { cx } from '../../lib';

import { createChatHeaderComponent } from './ChatHeader';
import { createChatMessagesComponent } from './ChatMessages';
import { createChatPromptComponent } from './ChatPrompt';
import { createChatPromptSuggestionsComponent } from './ChatPromptSuggestions';
import { createChatToggleButtonComponent } from './ChatToggleButton';

import type { Renderer, ComponentProps } from '../../types';
import type { ChatHeaderProps, ChatHeaderOwnProps } from './ChatHeader';
import type { ChatMessagesProps } from './ChatMessages';
import type { ChatPromptProps, ChatPromptOwnProps } from './ChatPrompt';
import type { ChatPromptSuggestionsOwnProps } from './ChatPromptSuggestions';
import type {
  ChatToggleButtonOwnProps,
  ChatToggleButtonProps,
} from './ChatToggleButton';

export type ChatClassNames = {
  root?: string | string[];
  container?: string | string[];
  header?: ChatHeaderProps['classNames'];
  messages?: ChatMessagesProps['classNames'];
  message?: ChatMessagesProps['messageClassNames'];
  prompt?: ChatPromptProps['classNames'];
  toggleButton?: ChatToggleButtonProps['classNames'];
  suggestions?: ChatPromptSuggestionsOwnProps['classNames'];
};

export type ChatMode = 'overlay' | 'side-panel' | 'inline';

export type ChatProps = Omit<ComponentProps<'div'>, 'onError' | 'title'> & {
  /*
   * The display mode of the chat widget.
   * - 'overlay' (default): Fixed bottom-right overlay
   * - 'side-panel': Fixed right-edge full-height panel
   * - 'inline': Flows within the page layout
   */
  mode?: ChatMode;
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
  /*
   * Props for the ChatPromptSuggestions component.
   */
  suggestionsProps: ChatPromptSuggestionsOwnProps;
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
  headerComponent?: (props: ChatHeaderOwnProps) => JSX.Element;
  /**
   * Optional prompt component for the chat
   */
  promptComponent?: (props: ChatPromptOwnProps) => JSX.Element;
  /**
   * Optional toggle button component for the chat
   */
  toggleButtonComponent?: (props: ChatToggleButtonOwnProps) => JSX.Element;
  /**
   * Optional suggestions component for the chat
   */
  suggestionsComponent?: (props: ChatPromptSuggestionsOwnProps) => JSX.Element;
};

export function createChatComponent({ createElement, Fragment }: Renderer) {
  const ChatToggleButton = createChatToggleButtonComponent({
    createElement,
    Fragment,
  });
  const ChatHeader = createChatHeaderComponent({ createElement, Fragment });
  const ChatMessages = createChatMessagesComponent({ createElement, Fragment });
  const ChatPrompt = createChatPromptComponent({ createElement, Fragment });
  const ChatPromptSuggestions = createChatPromptSuggestionsComponent({
    createElement,
    Fragment,
  });

  return function Chat(userProps: ChatProps) {
    const {
      mode = 'overlay',
      open,
      maximized = false,
      headerProps,
      toggleButtonProps,
      messagesProps,
      suggestionsProps,
      promptProps = {},
      headerComponent: HeaderComponent,
      promptComponent: PromptComponent,
      toggleButtonComponent: ToggleButtonComponent,
      suggestionsComponent: SuggestionsComponent,
      classNames = {},
      className,
      ...props
    } = userProps;

    // In inline mode, the chat is always open and has no toggle button
    const effectiveOpen = mode === 'inline' ? true : open;
    const showToggleButton = mode !== 'inline';

    return (
      <div
        {...props}
        className={cx(
          'ais-Chat',
          mode !== 'overlay' && `ais-Chat--${mode}`,
          maximized && 'ais-Chat--maximized',
          classNames.root,
          className
        )}
      >
        <div
          className={cx(
            'ais-Chat-container',
            effectiveOpen && 'ais-Chat-container--open',
            maximized && 'ais-Chat-container--maximized',
            classNames.container
          )}
        >
          {createElement(HeaderComponent || ChatHeader, {
            ...headerProps,
            classNames: classNames.header,
            maximized,
          })}
          <ChatMessages
            {...messagesProps}
            classNames={classNames.messages}
            messageClassNames={classNames.message}
            {...(mode === 'inline' && { visibleMessageCount: 2 })}
            suggestionsElement={createElement(
              SuggestionsComponent || ChatPromptSuggestions,
              {
                ...suggestionsProps,
                classNames: classNames.suggestions,
              }
            )}
          />
          {createElement(PromptComponent || ChatPrompt, {
            ...promptProps,
            classNames: classNames.prompt,
          })}
        </div>

        {showToggleButton && (
          <div className="ais-Chat-toggleButtonWrapper">
            {createElement(ToggleButtonComponent || ChatToggleButton, {
              ...toggleButtonProps,
              classNames: classNames.toggleButton,
              onClick: () => {
                toggleButtonProps.onClick?.();
                if (!open) {
                  promptProps.promptRef?.current?.focus();
                }
              },
            })}
          </div>
        )}
      </div>
    );
  };
}
