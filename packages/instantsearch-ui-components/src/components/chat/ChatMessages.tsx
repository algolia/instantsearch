/** @jsx createElement */

import { cx } from '../../lib';
import {
  findLastProgressPart,
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
  ChatMessageProps,
  ChatMessageActionProps,
  ChatMessageClassNames,
  ChatMessageTranslations,
} from './ChatMessage';
import type { ChatMessageErrorProps } from './ChatMessageError';
import type { ChatMessageLoaderPropsWithContext } from './ChatMessageLoader';
import type {
  ChatComponentContext,
  ChatComponentPropsWithContext,
  ChatEmptyProps,
  ChatLayoutOwnProps,
  ChatLoaderContext,
  ChatLoaderPhase,
  ChatLoaderPosition,
  ChatMessageBase,
  ChatStatus,
  ClientSideTools,
} from './types';
import type {
  ComponentProps,
  Hooks,
  MutableRef,
  Renderer,
  VNode,
} from '../../types';

export type ChatMessagesTranslations = {
  /**
   * Label for the scroll to bottom button
   */
  scrollToBottomLabel: string;
  /**
   * Text to display in the loader. A function can label the wait by what the
   * turn is doing (`context.phase`).
   */
  loaderText?: string | ((context: ChatLoaderContext) => string);
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

type ChatMessageRoleProps<TMessage extends ChatMessageBase = ChatMessageBase> =
  Partial<
    Omit<ChatMessageProps<TMessage>, 'ref' | 'key' | 'message' | 'messages'>
  > &
    Partial<Pick<ChatMessageProps, 'message' | 'messages'>>;

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
    props: ChatComponentPropsWithContext<{ message: TMessage }, TMessage>
  ) => JSX.Element;
  /**
   * Custom loader component. Receives the turn context alongside the resolved
   * `translations`.
   */
  loaderComponent?: (
    props: ChatMessageLoaderPropsWithContext<TMessage>
  ) => JSX.Element;
  /**
   * Where the loader renders.
   * @default 'messages-end'
   */
  loaderPosition?: ChatLoaderPosition;
  /**
   * Overrides when the loader shows. Receives the turn context plus the
   * built-in decision as `defaultValue`, so it can be narrowed or widened
   * instead of reimplemented. Smoothing still applies to the result.
   */
  shouldShowLoader?: (
    context: ChatLoaderContext<TMessage> & { defaultValue: boolean }
  ) => boolean;
  /**
   * How long (ms) a renewed loading state must hold before the loader comes
   * back after having been hidden in the same turn. The turn's first loader is
   * never delayed.
   * @default 250
   */
  loaderShowDelay?: number;
  /**
   * Minimum time (ms) the loader stays on screen once shown, while the turn is
   * still running. Guards against a one-frame flash.
   * @default 200
   */
  loaderMinDuration?: number;
  /**
   * Custom error component
   */
  errorComponent?: (
    props: ChatComponentPropsWithContext<ChatMessageErrorProps, TMessage>
  ) => JSX.Element;
  /**
   * Custom empty component shown when there are no messages
   */
  emptyComponent?: (
    // The deprecated root props are still passed alongside `context`.
    // eslint-disable-next-line typescript/no-deprecated
    props: ChatComponentPropsWithContext<ChatEmptyProps, TMessage>
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
  userMessageProps?: ChatMessageRoleProps<TMessage>;
  /**
   * Optional assistant message props
   */
  assistantMessageProps?: ChatMessageRoleProps<TMessage>;
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
   * Whether the suggestions for the current turn are still on their way. Mounts
   * `suggestionsElement` early so it can render its own loading state.
   */
  suggestionsLoading?: boolean;
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

const DEFAULT_LOADER_SHOW_DELAY = 250;
// Short enough that it never lingers over the content that replaced it.
const DEFAULT_LOADER_MIN_DURATION = 200;

function getInstantSearchStatus(tools: ClientSideTools) {
  return Object.values(tools).find((tool) => tool.insightsEventContext)
    ?.insightsEventContext?.instantSearchStatus;
}
// Own-key presence is what a JSX spread copies; `in` would also answer for
// inherited keys the spread leaves behind.
const hasOwnKey = (target: object | undefined, key: string) =>
  target !== undefined && Object.prototype.hasOwnProperty.call(target, key);

function createDefaultMessageComponent({ createElement, Fragment }: Renderer) {
  const ChatMessage = createChatMessageComponent({ createElement, Fragment });

  return function DefaultMessage<
    TMessage extends ChatMessageBase = ChatMessageBase,
  >({
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
    loaderElement,
    context,
  }: {
    key: string;
    message: TMessage;
    isCurrentMessage: boolean;
    status: ChatStatus;
    userMessageProps?: ChatMessageRoleProps<TMessage>;
    assistantMessageProps?: ChatMessageRoleProps<TMessage>;
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
    loaderElement?: VNode;
    context: ChatComponentContext<TMessage>;
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
        indexUiState={indexUiState}
        setIndexUiState={setIndexUiState}
        actions={defaultActions}
        actionsComponent={actionsComponent}
        data-role={message.role}
        classNames={classNames}
        translations={messageTranslations}
        suggestionsElement={suggestionsElement}
        loaderElement={loaderElement}
        context={context}
        {...messageProps}
        message={message}
        messages={context.messages}
      />
    );
  };
}

export function createChatMessagesComponent({
  createElement,
  Fragment,
  useMemo,
  useState,
  useEffect,
  useRef,
}: Renderer & Pick<Hooks, 'useMemo' | 'useState' | 'useEffect' | 'useRef'>) {
  const Button = createButtonComponent({ createElement });

  /**
   * Smooths the loading state into a visibility. Several transitions in a turn
   * flip it twice within a few frames, which reads as the loader popping in and
   * out, so a loader coming back mid-turn waits out `showDelay` and a visible
   * one holds for `minDuration`.
   */
  function useLoaderVisibility({
    isLoading,
    isTurnActive,
    showDelay,
    minDuration,
  }: {
    isLoading: boolean;
    isTurnActive: boolean;
    showDelay: number;
    minDuration: number;
  }) {
    // Derived during render, not committed from an effect: an effect-driven
    // show lands a frame late. State is only here to wake on a deadline.
    const [, scheduleRerender] = useState(0);
    const stateRef = useRef({
      isVisible: false,
      shownAt: 0,
      pendingSince: 0,
      hasHiddenInTurn: false,
    });

    const state = stateRef.current;
    const now = Date.now();

    if (!isTurnActive) {
      state.hasHiddenInTurn = false;
    }

    let isVisible = state.isVisible;

    if (isLoading) {
      state.pendingSince = state.pendingSince || now;
      // Only a loader coming *back* waits; the first one must be immediate.
      const delay = state.hasHiddenInTurn ? showDelay : 0;
      isVisible = now - state.pendingSince >= delay;
    } else {
      state.pendingSince = 0;
      // The minimum only applies while the turn is still running.
      if (isVisible) {
        isVisible = isTurnActive && now - state.shownAt < minDuration;
      }
    }

    if (isVisible && !state.isVisible) {
      state.shownAt = now;
    }
    // Only a hide *within* the turn arms the delay. The turn ending hides the
    // loader too, and arming on that would delay the next turn's first loader,
    // which has to be immediate.
    if (!isVisible && state.isVisible && isTurnActive) {
      state.hasHiddenInTurn = true;
    }
    state.isVisible = isVisible;

    let deadline = 0;
    if (isLoading && !isVisible) {
      deadline = state.pendingSince + showDelay;
    } else if (!isLoading && isVisible) {
      deadline = state.shownAt + minDuration;
    }

    useEffect(() => {
      if (!deadline) {
        return undefined;
      }

      const timer = setTimeout(
        () => scheduleRerender((tick) => tick + 1),
        Math.max(0, deadline - Date.now())
      );

      return () => clearTimeout(timer);
    }, [deadline]);

    return isVisible;
  }

  const DefaultMessageComponent = createDefaultMessageComponent({
    createElement,
    Fragment,
  });
  // Skip re-rendering (and re-compiling the markdown of) completed messages on
  // every streaming delta. The deps tuple matches the row's render inputs;
  // callbacks/`indexUiState` are intentionally excluded because `getUiState()`
  // returns a fresh object every render and would defeat the memo — completed
  // rows keep the callbacks/`indexUiState` they last rendered with until their
  // next genuine update.
  function MemoizedDefaultMessage<
    TMessage extends ChatMessageBase = ChatMessageBase,
  >(props: Parameters<typeof DefaultMessageComponent<TMessage>>[0]) {
    const messageFeedback = props.feedbackState?.[props.message.id];
    const instantSearchStatus = getInstantSearchStatus(props.context.tools);
    // Read the row's own side, mirroring `DefaultMessage`, so one role's change
    // neither invalidates the other's completed rows nor goes unnoticed here.
    const messageProps =
      props.message.role === 'user'
        ? props.userMessageProps
        : props.assistantMessageProps;
    const showReasoning = messageProps?.showReasoning;
    const parseMarkdown = messageProps?.parseMarkdown;
    const textComponent = messageProps?.textComponent;
    // Custom text components receive the conversation, so their completed rows
    // must update with it. Keep the default renderer's streaming optimization.
    const textComponentMessages = textComponent
      ? props.context.messages
      : undefined;
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
    // message on each streaming update, and `props.context` is a fresh object
    // every render — so track the specific context fields a completed row can
    // render from (panel display state read by tool components) rather than the
    // object itself, which would defeat the memo.
    return useMemo(
      () => <DefaultMessageComponent {...props} />,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        props.message,
        props.isCurrentMessage,
        props.status,
        props.context.maximized,
        props.context.open,
        instantSearchStatus,
        props.suggestionsElement,
        props.loaderElement,
        messageFeedback,
        showReasoning,
        parseMarkdown,
        textComponent,
        textComponentMessages,
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
      loaderPosition = 'messages-end',
      shouldShowLoader,
      loaderShowDelay = DEFAULT_LOADER_SHOW_DELAY,
      loaderMinDuration = DEFAULT_LOADER_MIN_DURATION,
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
      suggestionsLoading = false,
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
    const showReasoning = assistantMessageProps?.showReasoning;
    const lastPart = lastMessage?.parts?.[lastMessage.parts.length - 1];
    // `activePart` means "the part currently being processed". It must clear
    // when nothing is in progress: once the response settles (`ready`/`error`),
    // and while `submitted` still shows the user's own message (the assistant
    // hasn't produced a part yet). Otherwise overrides render a part that isn't
    // actually streaming.
    const isProcessing = status === 'submitted' || status === 'streaming';
    const activePart =
      isProcessing && lastMessage?.role === 'assistant' ? lastPart : undefined;
    // The scan slices the remaining parts per candidate, and only the loader reads
    // it, so skip it entirely while the opt-in is off.
    const hasActiveReasoning = showReasoning
      ? (lastMessage?.parts?.some((_, index, parts) =>
          isReasoningPartActive(parts, index)
        ) ?? false)
      : false;
    // The shared context handed to every overridable chat component, so custom
    // components can read the current chat state and common callbacks from a
    // single, consistent place.
    const context: ChatComponentContext<TMessage> = {
      messages,
      status,
      error,
      isClearing,
      open,
      maximized,
      activePart,
      tools,
      sendMessage,
      regenerate,
      stop,
      setInput,
      onReload,
      onNewConversation,
      onClose,
    };

    // The loader also reads what the turn is doing, which no other component
    // needs, so its context extends the shared one.
    const loaderContext: ChatLoaderContext<TMessage> = {
      ...context,
      phase: getLoaderPhase(status, lastMessage, showReasoning),
      message: lastMessage,
    };

    const defaultShowLoader = getShowLoader(
      status,
      lastMessage,
      tools,
      showReasoning,
      hasActiveReasoning
    );
    const isLoading = shouldShowLoader
      ? shouldShowLoader({ ...loaderContext, defaultValue: defaultShowLoader })
      : defaultShowLoader;
    const showLoader = useLoaderVisibility({
      isLoading,
      isTurnActive: status === 'submitted' || status === 'streaming',
      showDelay: loaderShowDelay,
      minDuration: loaderMinDuration,
    });

    const showEmpty =
      messages.length === 0 && !showLoader && !isClearing && status !== 'error';

    const DefaultMessage = MessageComponent || MemoizedDefaultMessage;
    const DefaultLoader = LoaderComponent || DefaultLoaderComponent;
    const DefaultError = ErrorComponent || DefaultErrorComponent;

    // An inline loader needs an assistant message to live in; before the first
    // response part there is none, so it falls back to its own row.
    const isLoaderInline =
      loaderPosition === 'message-inline' && lastMessage?.role === 'assistant';
    const loaderText =
      typeof translations.loaderText === 'function'
        ? translations.loaderText(loaderContext)
        : translations.loaderText;
    const loaderElement = showLoader ? (
      <DefaultLoader
        context={loaderContext}
        inline={isLoaderInline}
        translations={{ loaderText }}
      />
    ) : undefined;

    // Waits for the answer's text and for the loader to step aside, so two
    // progress affordances never stack up.
    const showPendingSuggestions =
      suggestionsLoading &&
      !showLoader &&
      lastMessage !== undefined &&
      hasTextContent(lastMessage);

    return (
      <div
        {...props}
        className={cx(cssClasses.root, props.className)}
        role="log"
        aria-live="polite"
        aria-busy={showLoader ? 'true' : undefined}
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
              <EmptyComponent
                // Deprecated root-level props, kept alongside `context` for
                // empty/greeting components written against the previous API.
                // Remove in the next major.
                sendMessage={sendMessage}
                setInput={setInput}
                status={status}
                onClose={onClose}
                context={context}
              />
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
                context={context}
                suggestionsElement={
                  (status === 'ready' || showPendingSuggestions) &&
                  message.role === 'assistant' &&
                  index === messages.length - 1
                    ? suggestionsElement
                    : undefined
                }
                loaderElement={
                  isLoaderInline && index === messages.length - 1
                    ? loaderElement
                    : undefined
                }
              />
            ))}

            {!isLoaderInline && loaderElement}

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
                context={context}
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

const getLoaderPhase = (
  status: ChatStatus,
  message: ChatMessageBase | undefined,
  showReasoning: boolean | undefined
): ChatLoaderPhase => {
  if (status === 'submitted') return 'submitted';

  const lastPart = findLastProgressPart(message?.parts);
  if (!lastPart) return 'thinking';
  if (isPartTool(lastPart)) return 'tool';
  if (showReasoning && lastPart.type === 'reasoning') return 'reasoning';

  return 'thinking';
};

const getShowLoader = (
  status: ChatStatus,
  message: ChatMessageBase | undefined,
  tools: ClientSideTools,
  showReasoning: boolean | undefined,
  hasActiveReasoning: boolean
): boolean => {
  if (status !== 'submitted' && status !== 'streaming') return false;
  if (status === 'submitted') return true;

  // Parts that render nothing must not answer for the turn's progress, or the
  // loader flips on a part that changed nothing on screen.
  const lastPart = findLastProgressPart(message?.parts);
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
