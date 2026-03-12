/** @jsx createElement */
/** @jsxFrag Fragment */

import { createChatHeaderComponent } from './ChatHeader';
import { createChatMessagesComponent } from './ChatMessages';
import { createChatOverlayLayoutComponent } from './ChatOverlayLayout';
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
import type { ChatLayoutOwnProps } from './types';

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
  /**
   * Optional layout component for the chat.
   */
  layoutComponent?: (props: ChatLayoutOwnProps) => JSX.Element;
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
  const OverlayLayout = createChatOverlayLayoutComponent({
    createElement,
    Fragment,
  });

  return function Chat(userProps: ChatProps) {
    const {
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
      layoutComponent: LayoutComponent,
      classNames = {},
      className: _className,
      ...props
    } = userProps;

    const headerElement = createElement(HeaderComponent || ChatHeader, {
      ...headerProps,
      classNames: classNames.header,
      maximized,
    });

    const messagesElement = (
      <ChatMessages
        {...messagesProps}
        classNames={classNames.messages}
        messageClassNames={classNames.message}
        suggestionsElement={createElement(
          SuggestionsComponent || ChatPromptSuggestions,
          {
            ...suggestionsProps,
            classNames: classNames.suggestions,
          }
        )}
      />
    );

    const promptElement = createElement(PromptComponent || ChatPrompt, {
      ...promptProps,
      classNames: classNames.prompt,
    });

    const toggleButtonElement = createElement(
      ToggleButtonComponent || ChatToggleButton,
      {
        ...toggleButtonProps,
        classNames: classNames.toggleButton,
        onClick: () => {
          toggleButtonProps.onClick?.();
          if (!open) {
            promptProps.promptRef?.current?.focus();
          }
        },
      }
    );

    const ResolvedLayout = LayoutComponent || OverlayLayout;

    return (
      <ResolvedLayout
        {...props}
        open={open}
        maximized={maximized}
        headerElement={headerElement}
        messagesElement={messagesElement}
        promptElement={promptElement}
        toggleButtonElement={toggleButtonElement}
        classNames={{ root: classNames.root, container: classNames.container }}
        messages={messagesProps.messages}
        status={messagesProps.status}
        tools={messagesProps.tools}
        isClearing={messagesProps.isClearing}
        clearMessages={headerProps.onClear}
        onClearTransitionEnd={messagesProps.onClearTransitionEnd}
        suggestions={suggestionsProps.suggestions}
      />
    );
  };
}
