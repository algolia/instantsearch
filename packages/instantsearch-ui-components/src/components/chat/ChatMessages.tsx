/** @jsx createElement */

import { cx } from '../../lib';
import {
  findTool,
  getTextContent,
  hasTextContent,
  isReasoningPartActive,
  isPartText,
  isPartTool,
} from '../../lib/utils/chat';
import { createButtonComponent } from '../Button';

import { createChatMessageComponent } from './ChatMessage';
import { createChatMessageErrorComponent } from './ChatMessageError';
import { createChatMessageLoaderComponent } from './ChatMessageLoader';
import {
  ChevronDownIcon,
  CheckIcon,
  CopyIcon,
  LoadingSpinnerIcon,
  ReloadIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
} from './icons';

import type {
  ComponentProps,
  Hooks,
  MutableRef,
  Renderer,
  VNode,
} from '../../types';
import type {
  ChatMessageProps,
  ChatMessageActionProps,
  ChatMessageClassNames,
  ChatMessageTranslations,
} from './ChatMessage';
import type { ChatMessageErrorProps } from './ChatMessageError';
import type { ChatMessageLoaderProps } from './ChatMessageLoader';
import type {
  ChatComponentMetadata,
  ChatComponentPropsWithMetadata,
  ChatLayoutOwnProps,
  ChatMessageBase,
  ChatStatus,
  ClientSideTools,
} from './types';

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
  /**
   * Label for the thumbs up action
   */
  thumbsUpLabel?: string;
  /**
   * Label for the thumbs down action
   */
  thumbsDownLabel?: string;
  /**
   * Text shown after submitting feedback
   */
  feedbackThankYouText?: string;
  /**
   * Label for the feedback spinner
   */
  sendingFeedbackLabel?: string;
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
  TMessage extends ChatMessageBase = ChatMessageBase,
> = ComponentProps<'div'> & {
  /**
   * Array of messages to display
   */
  messages: TMessage[];
  /**
   * Custom message renderer
   */
  messageComponent?: (
    props: ChatComponentPropsWithMetadata<{ message: TMessage }, TMessage>
  ) => JSX.Element;
  /**
   * Custom loader component
   */
  loaderComponent?: (
    props: ChatComponentPropsWithMetadata<ChatMessageLoaderProps, TMessage>
  ) => JSX.Element;
  /**
   * Custom error component
   */
  errorComponent?: (
    props: ChatComponentPropsWithMetadata<ChatMessageErrorProps, TMessage>
  ) => JSX.Element;
  /**
   * Custom empty component shown when there are no messages
   */
  emptyComponent?: (
    props: ChatComponentPropsWithMetadata<{}, TMessage>
  ) => JSX.Element;
  /**
   * Custom actions component
   */
  actionsComponent?: ChatMessageProps['actionsComponent'];
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
  tools: ClientSideTools;
  /**
   * Current chat status
   */
  status?: ChatStatus;
  /**
   * Error from the last failed request, if any. When set, its `message` is
   * available to custom error components or translation functions (for example
   * API `message` fields on 403 responses).
   */
  error?: Error;
  /**
   * Whether to hide the scroll to bottom button
   */
  hideScrollToBottom?: boolean;
  /**
   * Callback for reload action
   */
  onReload: (messageId?: string) => void;
  /**
   * Callback to start a new conversation from the default error component.
   * When provided (and no custom `errorComponent`/`actions` override it),
   * the error renders a "New conversation" button that clears the messages
   * and rotates the chat id. When omitted, the error renders with no action
   * button (recommended default for guardrails-style errors).
   */
  onNewConversation?: () => void;
  /**
   * Function to close the chat
   */
  onClose: () => void;
  /**
   * Function to send a message to the chat
   */
  sendMessage?: ChatLayoutOwnProps['sendMessage'];
  /**
   * Function to regenerate the last assistant response
   */
  regenerate?: ChatLayoutOwnProps['regenerate'];
  /**
   * Function to stop the current streaming response
   */
  stop?: ChatLayoutOwnProps['stop'];
  /**
   * Whether the chat panel is open
   */
  open?: boolean;
  /**
   * Whether the chat panel is maximized
   */
  maximized?: boolean;
  /**
   * Function to set the prompt input value
   */
  setInput?: (input: string) => void;
  /**
   * Optional class names
   */
  classNames?: Partial<ChatMessagesClassNames>;
  /**
   * Optional message class names
   */
  messageClassNames?: Partial<ChatMessageClassNames>;
  /**
   * Optional translations
   */
  translations?: Partial<ChatMessagesTranslations>;
  /**
   * Optional message translations
   */
  messageTranslations?: Partial<ChatMessageTranslations>;
  /**
   * Optional user message props
   */
  userMessageProps?: Partial<Omit<ChatMessageProps, 'ref' | 'key'>>;
  /**
   * Optional assistant message props
   */
  assistantMessageProps?: Partial<Omit<ChatMessageProps, 'ref' | 'key'>>;
  /**
   * Whether the scroll is at the bottom (controlled state)
   */
  isScrollAtBottom?: boolean;
  /**
   * Whether the messages are clearing (for animation)
   */
  isClearing?: boolean;
  /**
   * Callback for when clearing transition ends
   */
  onClearTransitionEnd?: () => void;
  /**
   * Ref callback for the scroll container element
   */
  scrollRef?: MutableRef<HTMLDivElement | null>;
  /**
   * Ref callback for the content element
   */
  contentRef?: MutableRef<HTMLDivElement | null>;
  /**
   * Callback to scroll to bottom
   */
  onScrollToBottom?: () => void;
  /**
   * Suggestions element to display below a message
   */
  suggestionsElement?: VNode;
  /**
   * Callback for feedback (thumbs up/down) on a message.
   */
  onFeedback?: (messageId: string, vote: 0 | 1) => void;
  /**
   * Map of message IDs to their feedback state.
   */
  feedbackState?: Record<string, 'sending' | 0 | 1>;
};

const copyToClipboard = (message: ChatMessageBase) => {
  navigator.clipboard.writeText(getTextContent(message));
};

function getInstantSearchStatus(tools: ClientSideTools) {
  return Object.values(tools).find((tool) => tool.insightsEventContext)
    ?.insightsEventContext?.instantSearchStatus;
}
// Own-key presence is what a JSX spread copies; `in` would also answer for
// inherited keys the spread leaves behind.
const hasOwnKey = (target: object | undefined, key: string) =>
  target !== undefined && Object.prototype.hasOwnProperty.call(target, key);

function createDefaultMessageComponent<
  TMessage extends ChatMessageBase = ChatMessageBase,
>({ createElement, Fragment }: Renderer) {
  const ChatMessage = createChatMessageComponent({ createElement, Fragment });

  return function DefaultMessage({
    message,
    userMessageProps,
    assistantMessageProps,
    indexUiState,
    setIndexUiState,
    onReload,
    onFeedback,
    feedbackState,
    actionsComponent,
    classNames,
    messageTranslations,
    translations,
    suggestionsElement,
    metadata,
  }: {
    key: string;
    message: TMessage;
    isCurrentMessage: boolean;
    status: ChatStatus;
    userMessageProps?: Partial<ChatMessageProps>;
    assistantMessageProps?: Partial<ChatMessageProps>;
    indexUiState: object;
    setIndexUiState: (state: object) => void;
    onReload: (messageId?: string) => void;
    onFeedback?: (messageId: string, vote: 0 | 1) => void;
    feedbackState?: Record<string, 'sending' | 0 | 1>;
    actionsComponent?: ChatMessageProps['actionsComponent'];
    translations: ChatMessagesTranslations;
    classNames?: Partial<ChatMessageClassNames>;
    messageTranslations?: Partial<ChatMessageTranslations>;
    suggestionsElement?: VNode;
    metadata: ChatComponentMetadata<TMessage>;
  }) {
    const defaultAssistantActions: ChatMessageActionProps[] = [
      ...(hasTextContent(message)
        ? [
            {
              title: translations.copyToClipboardLabel,
              icon: () => <CopyIcon createElement={createElement} />,
              onClick: copyToClipboard,
            },
          ]
        : []),
      {
        title: translations.regenerateLabel,
        icon: () => <ReloadIcon createElement={createElement} />,
        onClick: (m) => onReload(m.id),
      },
    ];

    const messageFeedback = feedbackState?.[message.id];
    const hasVoted = messageFeedback !== undefined;

    if (onFeedback) {
      const isSending = messageFeedback === 'sending';
      if (isSending) {
        defaultAssistantActions.push({
          title: translations.sendingFeedbackLabel,
          icon: () => (
            <span className="ais-ChatMessage-feedbackSpinner">
              <LoadingSpinnerIcon createElement={createElement} />
            </span>
          ),
          disabled: true,
        });
      } else if (hasVoted) {
        defaultAssistantActions.push({
          title: translations.feedbackThankYouText,
          icon: () => (
            <span className="ais-ChatMessage-feedbackCheck">
              <CheckIcon createElement={createElement} />
              <span className="ais-ChatMessage-feedbackText">
                {translations.feedbackThankYouText}
              </span>
            </span>
          ),
          disabled: true,
        });
      } else {
        defaultAssistantActions.push(
          {
            title: translations.thumbsUpLabel,
            icon: () => <ThumbsUpIcon createElement={createElement} />,
            onClick: (m: ChatMessageBase) => onFeedback(m.id, 1),
          },
          {
            title: translations.thumbsDownLabel,
            icon: () => <ThumbsDownIcon createElement={createElement} />,
            onClick: (m: ChatMessageBase) => onFeedback(m.id, 0),
          }
        );
      }
    }

    const messageProps =
      message.role === 'user' ? userMessageProps : assistantMessageProps;
    const defaultActions =
      message.role === 'user' ? undefined : defaultAssistantActions;

    return (
      <ChatMessage
        side={message.role === 'user' ? 'right' : 'left'}
        variant={message.role === 'user' ? 'neutral' : 'subtle'}
        message={message}
        indexUiState={indexUiState}
        setIndexUiState={setIndexUiState}
        actions={defaultActions}
        actionsComponent={actionsComponent}
        data-role={message.role}
        classNames={classNames}
        translations={messageTranslations}
        suggestionsElement={suggestionsElement}
        metadata={metadata}
        {...messageProps}
      />
    );
  };
}

export function createChatMessagesComponent({
  createElement,
  Fragment,
  useMemo,
}: Renderer & Pick<Hooks, 'useMemo'>) {
  const Button = createButtonComponent({ createElement });
  const DefaultMessageComponent =
    createDefaultMessageComponent<ChatMessageBase>({ createElement, Fragment });
  // Skip re-rendering (and re-compiling the markdown of) completed messages on
  // every streaming delta. The deps tuple matches the row's render inputs;
  // callbacks/`indexUiState` are intentionally excluded because `getUiState()`
  // returns a fresh object every render and would defeat the memo — completed
  // rows keep the callbacks/`indexUiState` they last rendered with until their
  // next genuine update.
  function MemoizedDefaultMessage(
    props: Parameters<typeof DefaultMessageComponent>[0]
  ) {
    const messageFeedback = props.feedbackState?.[props.message.id];
    const instantSearchStatus = getInstantSearchStatus(props.metadata.tools);
    // Read the row's own side, mirroring `DefaultMessage`, so one role's change
    // neither invalidates the other's completed rows nor goes unnoticed here.
    const messageProps =
      props.message.role === 'user'
        ? props.userMessageProps
        : props.assistantMessageProps;
    const showReasoning = messageProps?.showReasoning;
    const parseMarkdown = messageProps?.parseMarkdown;
    // Object-level fallback, matching the render: the spread replaces
    // `translations` wholesale, and it copies a key holding `undefined` too. Both
    // are why this resolves by own-key presence rather than key by key.
    const reasoningTranslations = hasOwnKey(messageProps, 'translations')
      ? messageProps?.translations
      : props.messageTranslations;
    const reasoningLabel = reasoningTranslations?.reasoningLabel;
    const reasoningClassNames = hasOwnKey(messageProps, 'classNames')
      ? messageProps?.classNames
      : props.classNames;
    const reasoningClassName = cx(reasoningClassNames?.reasoning);
    const reasoningHeaderClassName = cx(reasoningClassNames?.reasoningHeader);
    const reasoningIconClassName = cx(reasoningClassNames?.reasoningIcon);
    const reasoningLabelClassName = cx(reasoningClassNames?.reasoningLabel);
    const reasoningChevronClassName = cx(reasoningClassNames?.reasoningChevron);
    const reasoningBodyClassName = cx(reasoningClassNames?.reasoningBody);
    const reasoningTextClassName = cx(reasoningClassNames?.reasoningText);
    // The row comparator. The full props object would recompile every completed
    // message on each streaming update.
    return useMemo(
      () => <DefaultMessageComponent {...props} />,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        props.message,
        props.isCurrentMessage,
        props.status,
        instantSearchStatus,
        props.suggestionsElement,
        messageFeedback,
        showReasoning,
        parseMarkdown,
        reasoningLabel,
        reasoningClassName,
        reasoningHeaderClassName,
        reasoningIconClassName,
        reasoningLabelClassName,
        reasoningChevronClassName,
        reasoningBodyClassName,
        reasoningTextClassName,
      ]
    );
  }
  const DefaultLoaderComponent = createChatMessageLoaderComponent({
    createElement,
  });
  const DefaultErrorComponent = createChatMessageErrorComponent({
    createElement,
  });

  return function ChatMessages<
    TMessage extends ChatMessageBase = ChatMessageBase,
  >(userProps: ChatMessagesProps<TMessage>) {
    const {
      classNames = {},
      messageClassNames = {},
      messageTranslations,
      messages = [],
      messageComponent: MessageComponent,
      loaderComponent: LoaderComponent,
      errorComponent: ErrorComponent,
      emptyComponent: EmptyComponent,
      actionsComponent: ActionsComponent,
      tools,
      indexUiState,
      setIndexUiState,
      status = 'ready',
      error,
      hideScrollToBottom = false,
      onReload,
      onNewConversation,
      onClose,
      sendMessage,
      regenerate = () => Promise.resolve(),
      stop = () => Promise.resolve(),
      open = false,
      maximized = false,
      setInput,
      translations: userTranslations,
      userMessageProps,
      assistantMessageProps,
      isClearing = false,
      onClearTransitionEnd,
      isScrollAtBottom,
      scrollRef,
      contentRef,
      onScrollToBottom,
      suggestionsElement,
      onFeedback,
      feedbackState,
      ...props
    } = userProps;

    const translations: ChatMessagesTranslations = {
      scrollToBottomLabel: 'Scroll to bottom',
      copyToClipboardLabel: 'Copy to clipboard',
      regenerateLabel: 'Regenerate',
      thumbsUpLabel: 'Like',
      thumbsDownLabel: 'Dislike',
      feedbackThankYouText: 'Thanks for your feedback!',
      sendingFeedbackLabel: 'Sending feedback...',
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

    const lastMessage = messages[messages.length - 1];
    const lastPart = lastMessage?.parts?.[lastMessage.parts.length - 1];
    // The scan slices the remaining parts per candidate, and only the loader reads
    // it, so skip it entirely while the opt-in is off.
    const hasActiveReasoning = assistantMessageProps?.showReasoning
      ? (lastMessage?.parts?.some((_, index, parts) =>
          isReasoningPartActive(parts, index)
        ) ?? false)
      : false;
    const showLoader = getShowLoader(
      status,
      lastPart,
      tools,
      assistantMessageProps?.showReasoning,
      hasActiveReasoning
    );

    // The shared bag handed to every overridable chat component, so custom
    // components can read the current chat state and common callbacks from a
    // single, consistent place.
    const metadata: ChatComponentMetadata<TMessage> = {
      messages,
      status,
      error,
      isClearing,
      open,
      maximized,
      activePart: lastPart,
      tools,
      sendMessage,
      regenerate,
      stop,
      setInput,
      onReload,
      onNewConversation,
      onClose,
    };

    const showEmpty =
      messages.length === 0 && !showLoader && !isClearing && status !== 'error';

    const DefaultMessage = MessageComponent || MemoizedDefaultMessage;
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
            {showEmpty && EmptyComponent && (
              <EmptyComponent metadata={metadata} />
            )}

            {messages.map((message, index) => (
              <DefaultMessage
                key={message.id}
                message={message}
                isCurrentMessage={index === messages.length - 1}
                status={status}
                userMessageProps={userMessageProps}
                assistantMessageProps={assistantMessageProps}
                indexUiState={indexUiState}
                setIndexUiState={setIndexUiState}
                onReload={onReload}
                onFeedback={onFeedback}
                feedbackState={feedbackState}
                actionsComponent={ActionsComponent}
                translations={translations}
                classNames={messageClassNames}
                messageTranslations={messageTranslations}
                metadata={metadata}
                suggestionsElement={
                  status === 'ready' &&
                  message.role === 'assistant' &&
                  index === messages.length - 1
                    ? suggestionsElement
                    : undefined
                }
              />
            ))}

            {showLoader && (
              <DefaultLoader
                translations={{ loaderText: translations.loaderText }}
                metadata={metadata}
              />
            )}

            {status === 'error' && (
              <DefaultError
                onNewConversation={onNewConversation}
                errorMessage={error?.message}
                translations={
                  // Guardrail violations come with a service-authored
                  // `fallbackResponse` that's safe to display verbatim; for
                  // every other error we keep hiding the raw `error.message`
                  // behind the friendly default. Detection is by `error.name`
                  // to avoid coupling this package to `instantsearch.js`.
                  error?.name === 'GuardrailViolationError'
                    ? {
                        errorMessage: ({ errorMessage: rawMessage }) =>
                          rawMessage ?? '',
                      }
                    : undefined
                }
                metadata={metadata}
              />
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          iconOnly
          className={cx(
            cssClasses.scrollToBottom,
            (hideScrollToBottom || isScrollAtBottom) &&
              cssClasses.scrollToBottomHidden
          )}
          onClick={onScrollToBottom}
          aria-label={translations.scrollToBottomLabel}
          tabIndex={isScrollAtBottom ? -1 : 0}
        >
          <ChevronDownIcon createElement={createElement} />
        </Button>
      </div>
    );
  };
}

const getShowLoader = (
  status: ChatStatus,
  lastPart: ChatMessageBase['parts'][number] | undefined,
  tools: ClientSideTools,
  showReasoning: boolean | undefined,
  hasActiveReasoning: boolean
): boolean => {
  if (status !== 'submitted' && status !== 'streaming') return false;
  if (status === 'submitted') return true;

  if (!lastPart) return true;
  // An active disclosure carries its own progress affordance, so the loader would
  // double it. Settled reasoning still shows it: the answer has not started.
  if (showReasoning && hasActiveReasoning) return false;
  if (isPartText(lastPart)) return false;

  if (isPartTool(lastPart) && lastPart.state === 'input-streaming') {
    const tool = findTool(lastPart.type, tools);
    return !tool?.streamInput;
  }

  return true;
};
