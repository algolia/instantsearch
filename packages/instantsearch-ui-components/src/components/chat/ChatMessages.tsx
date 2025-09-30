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
import type { ChatMessageProps, ChatMessageActionProps } from './ChatMessage';
import type { ChatMessageErrorProps } from './ChatMessageError';
import type { ChatMessageLoaderProps } from './ChatMessageLoader';
import type { ChatMessageBase, ChatStatus, ClientSideTool } from './types';

export type ChatMessagesTranslations = {
  /**
   * Label for the scroll to bottom button
   */
  scrollToBottomLabel: string;
  /**
   * Text to display in the loader
   */
  loaderText?: string;
  /**
   * Label for the copy to clipboard action
   */
  copyToClipboardLabel?: string;
  /**
   * Label for the regenerate action
   */
  regenerateLabel?: string;
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
  tools?: ClientSideTool[];
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
  /**
   * Whether the messages are clearing (for animation)
   */
  isClearing?: boolean;
  /**
   * Callback for when clearing transition ends
   */
  onClearTransitionEnd?: () => void;
};

const getTextContent = (message: ChatMessageBase) => {
  return message.parts
    .map((part) => ('text' in part ? part.text : ''))
    .join('');
};

const hasTextContent = (message: ChatMessageBase) => {
  return getTextContent(message).trim() !== '';
};

const copyToClipboard = (message: ChatMessageBase) => {
  navigator.clipboard.writeText(getTextContent(message));
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
    translations,
  }: {
    key: string;
    message: TMessage;
    userMessageProps?: Partial<ChatMessageProps>;
    assistantMessageProps?: Partial<ChatMessageProps>;
    indexUiState: object;
    setIndexUiState: (state: object) => void;
    tools?: ClientSideTool[];
    onReload?: (messageId?: string) => void;
    translations: ChatMessagesTranslations;
  }) {
    const defaultAssistantActions: ChatMessageActionProps[] = [
      ...(hasTextContent(message)
        ? [
            {
              title: translations.copyToClipboardLabel,
              icon: () => <CopyIconComponent createElement={createElement} />,
              onClick: copyToClipboard,
            },
          ]
        : []),
      {
        title: translations.regenerateLabel,
        icon: () => <ReloadIconComponent createElement={createElement} />,
        onClick: (m) => onReload?.(m.id),
      },
    ];

    const messageProps =
      message.role === 'user' ? userMessageProps : assistantMessageProps;
    const defaultActions =
      message.role === 'user' ? undefined : defaultAssistantActions;

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
      isClearing = false,
      onClearTransitionEnd,
      ...props
    } = userProps;

    const translations: ChatMessagesTranslations = {
      scrollToBottomLabel: 'Scroll to bottom',
      copyToClipboardLabel: 'Copy to clipboard',
      regenerateLabel: 'Regenerate',
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
          <div
            className={cx(
              cssClasses.content,
              isClearing && 'ais-ChatMessages-content--clearing'
            )}
            ref={contentRef}
            onTransitionEnd={(e) => {
              if (
                e.target === e.currentTarget &&
                e.propertyName === 'opacity' &&
                isClearing
              ) {
                onClearTransitionEnd?.();
              }
            }}
          >
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
                translations={translations}
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
          aria-label={translations.scrollToBottomLabel}
          tabIndex={isScrollAtBottom ? -1 : 0}
        >
          <ChevronDownIconComponent createElement={createElement} />
        </button>
      </div>
    );
  };
}
