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

// Fallback used when the flavor wrapper doesn't supply a `useState` hook. It
// returns a static value and a no-op setter, so the clearing animation is
// skipped and the clear is committed immediately (see `startClear`).
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

  // Resolve the state hook once, at factory time, so it's a stable reference
  // called unconditionally on every render (Rules of Hooks). Whether a real
  // hook was supplied also decides if the clear can animate at all.
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

    // The clear flow owns a fade-out animation: `isClearing` adds the CSS class
    // that fades the messages out, and the messages are only committed once the
    // opacity transition ends. This lifecycle is a view concern, so it lives
    // here rather than in the connector — the connector exposes a single
    // synchronous `clearMessages` commit (surfaced as `headerProps.onClear` /
    // `messagesProps.onNewConversation`), and this component decides when to
    // call it.
    const [isClearing, setIsClearing] = useClearingState(false);

    const commitClear = headerProps.onClear || messagesProps.onNewConversation;

    const startClear = () => {
      if (!commitClear) {
        return;
      }
      // Without a state hook there's no way to drive the animation, and when the
      // user prefers reduced motion the transition is disabled (`transition:
      // none`), so `transitionend` never fires. Commit immediately in both
      // cases; otherwise fade out and let `finishClear` commit on transition end.
      if (!hasStateHook || prefersReducedMotion()) {
        commitClear();
        return;
      }
      // Stop any in-flight stream now so the assistant stops responding
      // immediately rather than after the fade-out; the messages are then
      // removed once the transition ends (`finishClear` → `commitClear`).
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
