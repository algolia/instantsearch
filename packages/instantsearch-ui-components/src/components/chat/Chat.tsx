/** @jsx createElement */
/** @jsxFrag Fragment */

import { createChatHeaderComponent } from './ChatHeader';
import { createChatMessagesComponent } from './ChatMessages';
import { createChatOverlayLayoutComponent } from './ChatOverlayLayout';
import { createChatPromptComponent } from './ChatPrompt';
import { createChatPromptSuggestionsComponent } from './ChatPromptSuggestions';

import type { Renderer, ComponentProps, Hooks } from '../../types';
import type { ChatHeaderProps, ChatHeaderOwnProps } from './ChatHeader';
import type { ChatMessagesProps } from './ChatMessages';
import type { ChatPromptProps, ChatPromptOwnProps } from './ChatPrompt';
import type { ChatPromptSuggestionsOwnProps } from './ChatPromptSuggestions';
import type { ChatLayoutOwnProps } from './types';

export type ChatClassNames = {
  root?: string | string[];
  container?: string | string[];
  header?: ChatHeaderProps['classNames'];
  messages?: ChatMessagesProps['classNames'];
  message?: ChatMessagesProps['messageClassNames'];
  prompt?: ChatPromptProps['classNames'];
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
   * Optional suggestions component for the chat
   */
  suggestionsComponent?: (props: ChatPromptSuggestionsOwnProps) => JSX.Element;
  /**
   * Function to send a message to the chat.
   */
  sendMessage: ChatLayoutOwnProps['sendMessage'];
  /**
   * Function to regenerate the last assistant response.
   */
  regenerate: ChatLayoutOwnProps['regenerate'];
  /**
   * Function to stop the current streaming response.
   */
  stop: ChatLayoutOwnProps['stop'];
  /**
   * The current error, if any.
   */
  error: ChatLayoutOwnProps['error'];
  /**
   * Optional layout component for the chat.
   * @default ChatOverlayLayout
   */
  layoutComponent?: (props: ChatLayoutOwnProps) => JSX.Element;
};

// Fallback when the flavor supplies no `useState`: a static value and a no-op
// setter, so the clear commits immediately without animating.
function noopUseState<TState>(
  initialState: TState
): [TState, (value: TState | ((prev: TState) => TState)) => void] {
  return [initialState, () => {}];
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function createChatComponent({
  createElement,
  Fragment,
  memo,
  useState,
}: Renderer & Partial<Pick<Hooks, 'memo' | 'useState'>>) {
  const ChatHeader = createChatHeaderComponent({ createElement, Fragment });
  const ChatMessages = createChatMessagesComponent({
    createElement,
    Fragment,
    memo,
  });
  const ChatPrompt = createChatPromptComponent({ createElement, Fragment });
  const ChatPromptSuggestions = createChatPromptSuggestionsComponent({
    createElement,
    Fragment,
  });
  const OverlayLayout = createChatOverlayLayoutComponent({
    createElement,
    Fragment,
  });

  // Resolve once so the hook is a stable reference called unconditionally every
  // render (Rules of Hooks).
  const hasStateHook = Boolean(useState);
  const useClearingState = useState || noopUseState;

  return function Chat(userProps: ChatProps) {
    const {
      open,
      maximized = false,
      headerProps,
      messagesProps,
      suggestionsProps,
      promptProps = {},
      headerComponent: HeaderComponent,
      promptComponent: PromptComponent,
      suggestionsComponent: SuggestionsComponent,
      layoutComponent: LayoutComponent = OverlayLayout,
      classNames = {},
      className,
      sendMessage,
      regenerate,
      stop,
      error,
      ...props
    } = userProps;

    const [isClearing, setIsClearing] = useClearingState(false);

    const commitClear = headerProps.onClear || messagesProps.onNewConversation;

    const startClear = () => {
      if (!commitClear) {
        return;
      }
      // Reduced motion disables the transition, so `transitionend` never fires;
      // with no state hook there's nothing to animate. Commit immediately.
      if (!hasStateHook || prefersReducedMotion()) {
        commitClear();
        return;
      }
      // Stop streaming now so the assistant stops immediately, not after the fade.
      if (
        messagesProps.status === 'submitted' ||
        messagesProps.status === 'streaming'
      ) {
        stop();
      }
      setIsClearing(true);
    };

    const finishClear = () => {
      commitClear?.();
      setIsClearing(false);
    };

    const headerComponent = createElement(HeaderComponent || ChatHeader, {
      ...headerProps,
      onClear: commitClear ? startClear : headerProps.onClear,
      canClear: headerProps.canClear && !isClearing,
      classNames: classNames.header,
      maximized,
    });

    const messagesComponent = (
      <ChatMessages
        {...messagesProps}
        isClearing={isClearing}
        onClearTransitionEnd={finishClear}
        onNewConversation={
          commitClear ? startClear : messagesProps.onNewConversation
        }
        error={error}
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

    const promptComponent = createElement(PromptComponent || ChatPrompt, {
      ...promptProps,
      classNames: classNames.prompt,
    });

    return (
      <LayoutComponent
        {...props}
        open={open}
        maximized={maximized}
        headerComponent={headerComponent}
        messagesComponent={messagesComponent}
        promptComponent={promptComponent}
        classNames={{ root: classNames.root, container: classNames.container }}
        className={className}
        messages={messagesProps.messages}
        status={messagesProps.status}
        tools={messagesProps.tools}
        isClearing={isClearing}
        clearMessages={commitClear ? startClear : headerProps.onClear}
        onClearTransitionEnd={finishClear}
        suggestions={suggestionsProps.suggestions}
        sendMessage={sendMessage}
        regenerate={regenerate}
        stop={stop}
        error={error}
      />
    );
  };
}
