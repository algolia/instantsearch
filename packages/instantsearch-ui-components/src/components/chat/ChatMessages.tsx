/** @jsx createElement */
import { cx } from '../../lib';

import { createChatMessageComponent } from './ChatMessage';

import type { ComponentProps, MutableRef, Renderer } from '../../types';
import type { ChatMessageProps, Tools } from './ChatMessage';
import type { ChatMessageBase, ChatStatus } from './types';

export type ChatMessagesTranslations = {
  /**
   * Text for the scroll to bottom button
   */
  scrollToBottomText: string;
  /**
   * Label for the messages container
   */
  messagesLabel: string;
};

export type ChatMessagesClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the scroll container
   */
  scroll: string | string[];
  /**
   * Class names to apply to the content container
   */
  content: string | string[];
  /**
   * Class names to apply to the scroll to bottom button
   */
  scrollToBottom: string | string[];
};

export type ChatMessagesProps<
  TMessage extends ChatMessageBase = ChatMessageBase
> = ComponentProps<'div'> & {
  /**
   * Array of messages to display
   */
  messages: TMessage[];
  /**
   * Custom message renderer
   */
  messageComponent?: (props: {
    message: TMessage;
    isLast: boolean;
  }) => JSX.Element;
  /**
   * Custom loader component
   */
  loaderComponent?: () => JSX.Element;
  /**
   * Custom error component
   */
  errorComponent?: () => JSX.Element;
  /**
   * Current UI state of the index
   */
  indexUiState: object;
  /**
   * Function to update the UI state of the index
   */
  setIndexUiState: (state: object) => void;
  /**
   * Tools available for the assistant
   */
  tools?: Tools;
  /**
   * Current chat status
   */
  status?: ChatStatus;
  /**
   * Whether to hide the scroll to bottom button
   */
  hideScrollToBottom?: boolean;
  /**
   * Callback for reload action
   */
  onReload?: () => void;
  /**
   * Optional class names
   */
  classNames?: Partial<ChatMessagesClassNames>;
  /**
   * Optional translations
   */
  translations?: Partial<ChatMessagesTranslations>;
  userMessageProps?: ChatMessageProps;
  assistantMessageProps?: ChatMessageProps;
  scrollRef?: MutableRef<HTMLDivElement>;
  contentRef?: MutableRef<HTMLDivElement>;
  isScrollAtBottom?: boolean;
  scrollToBottom?: () => void;
};

function createDefaultScrollIconComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M3.646 5.646a.5.5 0 0 1 .708 0L8 9.293l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708z"
      />
    </svg>
  );
}

function createDefaultMessageComponent({ createElement, Fragment }: Renderer) {
  const ChatMessage = createChatMessageComponent({ createElement, Fragment });

  return function DefaultMessage({
    message,
    userMessageProps,
    assistantMessageProps,
    tools,
    indexUiState,
    setIndexUiState,
  }: {
    message: ChatMessageBase;
    userMessageProps?: Omit<ChatMessageProps, 'ref' | 'key'>;
    assistantMessageProps?: Omit<ChatMessageProps, 'ref' | 'key'>;
    indexUiState: object;
    setIndexUiState: (state: object) => void;
    tools?: Tools;
  }) {
    const messageProps =
      message.role === 'user' ? userMessageProps : assistantMessageProps;

    return (
      <ChatMessage
        content={<div>{message.parts}</div>}
        side={message.role === 'user' ? 'right' : 'left'}
        variant={message.role === 'user' ? 'neutral' : 'subtle'}
        message={message}
        tools={tools}
        indexUiState={indexUiState}
        setIndexUiState={setIndexUiState}
        {...messageProps}
      />
    );
  };
}

function createDefaultLoaderComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  return function DefaultLoader() {
    return (
      <div className="ais-ChatMessages-loader">
        <div className="ais-ChatMessages-loader-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  };
}

function createDefaultErrorComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  return function DefaultError({ onReload }: { onReload?: () => void }) {
    return (
      <div className="ais-ChatMessages-error">
        <span>Something went wrong</span>
        {onReload && (
          <button
            type="button"
            className="ais-ChatMessages-error-retry"
            onClick={onReload}
          >
            Retry
          </button>
        )}
      </div>
    );
  };
}

// Simple scroll to bottom functionality
const handleScrollToBottom = () => {
  const scrollContainer = document.querySelector('.ais-ChatMessages-scroll');
  if (scrollContainer) {
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }
};

export function createChatMessagesComponent({
  createElement,
  Fragment,
}: Renderer) {
  return function ChatMessages<
    TMessage extends ChatMessageBase = ChatMessageBase
  >(userProps: ChatMessagesProps<TMessage>) {
    const {
      classNames = {},
      messages = [],
      messageComponent: MessageComponent,
      loaderComponent: LoaderComponent,
      errorComponent: ErrorComponent,
      tools,
      indexUiState,
      setIndexUiState,
      status = 'ready',
      hideScrollToBottom = false,
      onReload,
      translations: userTranslations,
      userMessageProps,
      assistantMessageProps,
      scrollRef,
      contentRef,
      isScrollAtBottom,
      scrollToBottom = handleScrollToBottom,
      ...props
    } = userProps;

    const translations: Required<ChatMessagesTranslations> = {
      scrollToBottomText: 'Scroll to bottom',
      messagesLabel: 'Chat messages',
      ...userTranslations,
    };

    const cssClasses: ChatMessagesClassNames = {
      root: cx('ais-ChatMessages', classNames.root),
      scroll: cx('ais-ChatMessages-scroll', classNames.scroll),
      content: cx('ais-ChatMessages-content', classNames.content),
      scrollToBottom: cx(
        'ais-ChatMessages-scrollToBottom',
        classNames.scrollToBottom
      ),
    };

    const DefaultMessage =
      MessageComponent ||
      createDefaultMessageComponent({ createElement, Fragment });
    const DefaultLoader =
      LoaderComponent || createDefaultLoaderComponent({ createElement });
    const DefaultError =
      ErrorComponent || createDefaultErrorComponent({ createElement });
    const ScrollIcon = createDefaultScrollIconComponent;

    const renderMessage = (message: TMessage, index: number) => {
      const isLast = index === messages.length - 1;
      const isUser = message.role === 'user';
      const isAssistant = message.role === 'assistant';

      return (
        <div
          key={message.id}
          className={cx(
            'ais-ChatMessages-message',
            isUser && 'ais-ChatMessages-message--user',
            isAssistant && 'ais-ChatMessages-message--assistant'
          )}
          data-role={message.role}
        >
          <DefaultMessage
            message={message}
            isLast={isLast}
            userMessageProps={userMessageProps}
            assistantMessageProps={assistantMessageProps}
            tools={tools}
            indexUiState={indexUiState}
            setIndexUiState={setIndexUiState}
          />
        </div>
      );
    };

    return (
      <div
        {...props}
        className={cx(cssClasses.root, props.className)}
        role="log"
        aria-live="polite"
        aria-label={translations.messagesLabel}
      >
        <div className={cx(cssClasses.scroll)} ref={scrollRef}>
          <div className={cx(cssClasses.content)} ref={contentRef}>
            {messages.map((message, index) => renderMessage(message, index))}

            {status === 'submitted' && (
              <div className="ais-ChatMessages-message ais-ChatMessages-message--assistant">
                <DefaultLoader />
              </div>
            )}

            {status === 'error' && (
              <div className="ais-ChatMessages-message ais-ChatMessages-message--assistant">
                <DefaultError onReload={onReload} />
              </div>
            )}
          </div>
        </div>

        {!hideScrollToBottom && !isScrollAtBottom && (
          <button
            type="button"
            className={cx(cssClasses.scrollToBottom)}
            title={translations.scrollToBottomText}
            onClick={scrollToBottom}
            aria-label={translations.scrollToBottomText}
          >
            <ScrollIcon createElement={createElement} />
          </button>
        )}
      </div>
    );
  };
}
