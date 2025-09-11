/** @jsx createElement */
import { useMemo } from 'react';

import { cx } from '../../lib';

import { createChatMessageComponent } from './ChatMessage';
import { createChatMessageErrorComponent } from './ChatMessageError';
import { createChatMessageLoaderComponent } from './ChatMessageLoader';
import { ChevronDownIconComponent } from './icons';

import type { ComponentProps, MutableRef, Renderer } from '../../types';
import type { ChatMessageProps, Tools } from './ChatMessage';
import type { ChatMessageErrorProps } from './ChatMessageError';
import type { ChatMessageLoaderProps } from './ChatMessageLoader';
import type { ChatMessageBase, ChatStatus } from './types';

export type ChatMessagesTranslations = {
  /**
   * Text for the scroll to bottom button
   */
  scrollToBottomText: string;
  /**
   * Text to display in the loader
   */
  loaderText?: string;
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
  /**
   * Class names to apply to the scroll to bottom button when hidden
   */
  scrollToBottomHidden: string | string[];
};

export type ChatMessagesProps<
  TMessage extends ChatMessageBase = ChatMessageBase
  // Using `div` is resolving to `any`, so using `main` instead
> = Omit<ComponentProps<'main'>, 'key' | 'ref'> & {
  /**
   * Array of messages to display
   */
  messages: TMessage[];
  /**
   * Custom message renderer
   */
  messageComponent?: (props: { message: TMessage }) => JSX.Element;
  /**
   * Custom loader component
   */
  loaderComponent?: (props: ChatMessageLoaderProps) => JSX.Element;
  /**
   * Custom error component
   */
  errorComponent?: (props: ChatMessageErrorProps) => JSX.Element;
  indexUiState: object;
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
  userMessageProps?: Partial<Omit<ChatMessageProps, 'ref' | 'key'>>;
  assistantMessageProps?: Partial<Omit<ChatMessageProps, 'ref' | 'key'>>;
  scrollRef?: MutableRef<HTMLDivElement>;
  contentRef?: MutableRef<HTMLDivElement>;
  isScrollAtBottom?: boolean;
  onScrollToBottom?: () => void;
};

function createDefaultMessageComponent<
  TMessage extends ChatMessageBase = ChatMessageBase
>({ createElement, Fragment }: Renderer) {
  const ChatMessage = createChatMessageComponent({ createElement, Fragment });

  return function DefaultMessage({
    message,
    userMessageProps,
    assistantMessageProps,
    tools,
    indexUiState,
    setIndexUiState,
  }: {
    key: string;
    message: TMessage;
    userMessageProps?: Partial<Omit<ChatMessageProps, 'ref' | 'key'>>;
    assistantMessageProps?: Partial<Omit<ChatMessageProps, 'ref' | 'key'>>;
    indexUiState: object;
    setIndexUiState: (state: object) => void;
    tools?: Tools;
  }) {
    const messageProps =
      message.role === 'user' ? userMessageProps : assistantMessageProps;

    return (
      <ChatMessage
        side={message.role === 'user' ? 'right' : 'left'}
        variant={message.role === 'user' ? 'neutral' : 'subtle'}
        message={message}
        tools={tools}
        indexUiState={indexUiState}
        setIndexUiState={setIndexUiState}
        data-role={message.role}
        {...messageProps}
      />
    );
  };
}

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
      onScrollToBottom,
      ...props
    } = userProps;

    const translations: Required<ChatMessagesTranslations> = {
      scrollToBottomText: 'Scroll to bottom',
      loaderText: 'Thinking...',
      ...userTranslations,
    };

    const cssClasses: ChatMessagesClassNames = {
      root: cx('ais-ChatMessages', classNames.root),
      scroll: cx('ais-ChatMessages-scroll ais-Scrollbar', classNames.scroll),
      content: cx('ais-ChatMessages-content', classNames.content),
      scrollToBottom: cx(
        'ais-ChatMessages-scrollToBottom',
        classNames.scrollToBottom
      ),
      scrollToBottomHidden: cx(
        'ais-ChatMessages-scrollToBottom--hidden',
        classNames.scrollToBottomHidden
      ),
    };

    const DefaultMessage = useMemo(
      () =>
        MessageComponent ||
        createDefaultMessageComponent<TMessage>({ createElement, Fragment }),
      [MessageComponent]
    );
    const DefaultLoader = useMemo(
      () =>
        LoaderComponent || createChatMessageLoaderComponent({ createElement }),
      [LoaderComponent]
    );
    const DefaultError = useMemo(
      () =>
        ErrorComponent || createChatMessageErrorComponent({ createElement }),
      [ErrorComponent]
    );

    return (
      <div
        {...props}
        className={cx(cssClasses.root, props.className)}
        role="log"
        aria-live="polite"
      >
        <div className={cx(cssClasses.scroll)} ref={scrollRef}>
          <div className={cx(cssClasses.content)} ref={contentRef}>
            {messages.map((message) => (
              <DefaultMessage
                key={message.id}
                message={message}
                userMessageProps={userMessageProps}
                assistantMessageProps={assistantMessageProps}
                tools={tools}
                indexUiState={indexUiState}
                setIndexUiState={setIndexUiState}
              />
            ))}

            {status === 'submitted' && (
              <div className="ais-ChatMessage">
                <DefaultLoader
                  translations={{ loaderText: translations.loaderText }}
                />
              </div>
            )}

            {status === 'error' && <DefaultError onReload={onReload} />}
          </div>
        </div>

        <button
          type="button"
          className={cx(
            cssClasses.scrollToBottom,
            (hideScrollToBottom || isScrollAtBottom) &&
              cssClasses.scrollToBottomHidden
          )}
          onClick={onScrollToBottom}
          aria-label={translations.scrollToBottomText}
          tabIndex={isScrollAtBottom ? -1 : 0}
        >
          <ChevronDownIconComponent createElement={createElement} />
        </button>
      </div>
    );
  };
}
