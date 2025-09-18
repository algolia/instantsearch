/** @jsx createElement */

import { cx } from '../../lib';

import { createChatMessageComponent } from './ChatMessage';
import { createChatMessageErrorComponent } from './ChatMessageError';
import { createChatMessageLoaderComponent } from './ChatMessageLoader';
import {
  ChevronDownIconComponent,
  CopyIconComponent,
  ReloadIconComponent,
} from './icons';

import type { ComponentProps, MutableRef, Renderer } from '../../types';
import type {
  ChatMessageProps,
  Tools,
  ChatMessageActionProps,
} from './ChatMessage';
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
> = ComponentProps<'div'> & {
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
  /**
   * The index UI state
   */
  indexUiState: object;
  /**
   * Set the index UI state
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
  onReload?: (messageId?: string) => void;
  /**
   * Optional class names
   */
  classNames?: Partial<ChatMessagesClassNames>;
  /**
   * Optional translations
   */
  translations?: Partial<ChatMessagesTranslations>;
  /**
   * Optional user message props
   */
  userMessageProps?: Partial<Omit<ChatMessageProps, 'ref' | 'key'>>;
  /**
   * Optional assistant message props
   */
  assistantMessageProps?: Partial<Omit<ChatMessageProps, 'ref' | 'key'>>;
  /**
   * Optional scroll ref
   */
  scrollRef?: MutableRef<HTMLDivElement>;
  /**
   * Optional content ref
   */
  contentRef?: MutableRef<HTMLDivElement>;
  /**
   * Whether the scroll is at the bottom
   */
  isScrollAtBottom?: boolean;
  /**
   * Callback for scroll to bottom
   */
  onScrollToBottom?: () => void;
};

const copyToClipboard = (message: ChatMessageBase) => {
  navigator.clipboard.writeText(
    message.parts
      .map((part) => {
        if ('text' in part) {
          return part.text;
        }
        return '';
      })
      .join('')
  );
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
    onReload,
  }: {
    key: string;
    message: TMessage;
    userMessageProps?: Partial<ChatMessageProps>;
    assistantMessageProps?: Partial<ChatMessageProps>;
    indexUiState: object;
    setIndexUiState: (state: object) => void;
    tools?: Tools;
    onReload?: (messageId?: string) => void;
  }) {
    const defaultAssistantActions: ChatMessageActionProps[] = [
      {
        title: 'Copy to clipboard',
        icon: () => <CopyIconComponent createElement={createElement} />,
        onClick: copyToClipboard,
      },
      {
        title: 'Regenerate',
        icon: () => <ReloadIconComponent createElement={createElement} />,
        onClick: (m) => onReload?.(m.id),
      },
    ];

    const defaultUserActions: ChatMessageActionProps[] = [
      {
        title: 'Copy to clipboard',
        icon: () => <CopyIconComponent createElement={createElement} />,
        onClick: copyToClipboard,
      },
    ];
    const messageProps =
      message.role === 'user' ? userMessageProps : assistantMessageProps;
    const defaultActions =
      message.role === 'user' ? defaultUserActions : defaultAssistantActions;

    return (
      <ChatMessage
        side={message.role === 'user' ? 'right' : 'left'}
        variant={message.role === 'user' ? 'neutral' : 'subtle'}
        message={message}
        tools={tools}
        indexUiState={indexUiState}
        setIndexUiState={setIndexUiState}
        actions={defaultActions}
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
  const DefaultMessageComponent =
    createDefaultMessageComponent<ChatMessageBase>({ createElement, Fragment });
  const DefaultLoaderComponent = createChatMessageLoaderComponent({
    createElement,
  });
  const DefaultErrorComponent = createChatMessageErrorComponent({
    createElement,
  });

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

    const DefaultMessage = MessageComponent || DefaultMessageComponent;
    const DefaultLoader = LoaderComponent || DefaultLoaderComponent;
    const DefaultError = ErrorComponent || DefaultErrorComponent;

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
                onReload={onReload}
              />
            ))}

            {status === 'submitted' && (
              <DefaultLoader
                translations={{ loaderText: translations.loaderText }}
              />
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
