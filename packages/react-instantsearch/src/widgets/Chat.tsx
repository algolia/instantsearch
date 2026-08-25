import { createChatComponent } from 'instantsearch-ui-components';
import {
  SearchIndexToolType,
  RecommendToolType,
  MemorizeToolType,
  MemorySearchToolType,
  PonderToolType,
  DisplayResultsToolType,
} from 'instantsearch.js/es/lib/chat';
import {
  focusAfterReveal,
  getActiveContainerAnimations,
  holdContainerInertUntilReveal,
  restoreContainerInertUntilReveal,
} from 'instantsearch.js/es/lib/chat/focusAfterReveal';
import React, {
  createElement,
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useInstantSearch, useChat } from 'react-instantsearch-core';

import { useStickToBottom } from '../lib/useStickToBottom';

import { createDisplayResultsTool } from './chat/tools/DisplayResultsTool';
import { createCarouselTool } from './chat/tools/SearchIndexTool';

export {
  SearchIndexToolType,
  RecommendToolType,
  MemorizeToolType,
  MemorySearchToolType,
  PonderToolType,
  DisplayResultsToolType,
};

import type {
  Pragma,
  ClientSideToolShouldRenderContext,
  ChatProps as ChatUiProps,
  ChatLayoutOwnProps,
  RecommendComponentProps,
  RecordWithObjectID,
  UserClientSideTool,
  UserClientSideTools,
  ChatMessageProps,
} from 'instantsearch-ui-components';
import type { IndexUiState } from 'instantsearch.js';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';
import type { ContainerAnimationSnapshot } from 'instantsearch.js/es/lib/chat/focusAfterReveal';
import type { UseChatProps } from 'react-instantsearch-core';

const ChatUiComponent = createChatComponent({
  createElement: createElement as Pragma,
  Fragment,
  useMemo,
  useState,
  useEffect,
});

export function createDefaultTools<TObject extends RecordWithObjectID>(
  itemComponent?: ItemComponent<TObject>,
  getSearchPageURL?: (nextUiState: IndexUiState) => string
): UserClientSideTools {
  return {
    [SearchIndexToolType]: {
      ...createCarouselTool(true, itemComponent, getSearchPageURL),
      // The agent decides per turn whether the richer display-results tool
      // takes over the rendering of the search results.
      shouldRender: isDisplayResultsDisabled,
    },
    [RecommendToolType]: createCarouselTool(
      false,
      itemComponent,
      getSearchPageURL
    ),
    [DisplayResultsToolType]: createDisplayResultsTool(itemComponent),
    [MemorizeToolType]: {},
    [MemorySearchToolType]: {},
    [PonderToolType]: {},
  };
}

/**
 * Whether the search tool renders its own results, i.e. the agent did not hand
 * the turn to the display-results tool. Set on the message by the backend.
 */
function isDisplayResultsDisabled({
  parentMessage,
}: ClientSideToolShouldRenderContext) {
  return (
    (parentMessage.metadata as { displayResultsEnabled?: boolean } | undefined)
      ?.displayResultsEnabled !== true
  );
}

function mergeToolOptions<
  TTool extends {
    streamInput?: boolean;
    shouldRender?: unknown;
    layoutComponent?: unknown;
  },
>(
  defaultTools: Record<string, TTool>,
  userTools?: Record<string, TTool>
): Record<string, TTool> {
  if (!userTools) {
    return defaultTools;
  }

  const tools = { ...defaultTools, ...userTools };

  Object.keys(userTools).forEach((toolName) => {
    const userTool = userTools[toolName];
    const defaultTool = defaultTools[toolName];
    const defaultStreamInput = defaultTool?.streamInput;

    if (
      userTool.layoutComponent !== undefined &&
      userTool.streamInput === undefined &&
      defaultStreamInput !== undefined
    ) {
      tools[toolName] = {
        ...tools[toolName],
        streamInput: defaultStreamInput,
      };
    }

    // Overriding a tool's rendering shouldn't opt it out of the conditions
    // under which the default renders at all.
    if (userTool.shouldRender === undefined && defaultTool?.shouldRender) {
      tools[toolName] = {
        ...tools[toolName],
        shouldRender: defaultTool.shouldRender,
      };
    }
  });

  return tools;
}

type ItemComponent<TObject> = RecommendComponentProps<TObject>['itemComponent'];

type UiProps = Pick<
  ChatUiProps,
  | 'open'
  | 'headerProps'
  | 'messagesProps'
  | 'promptProps'
  | 'suggestionsProps'
  | 'headerComponent'
  | 'promptComponent'
  | 'suggestionsComponent'
  | 'layoutComponent'
  | 'sendMessage'
  | 'regenerate'
  | 'stop'
  | 'error'
>;

type UserHeaderProps = Omit<ChatUiProps['headerProps'], 'onClose'>;

type UserMessagesProps<TUiMessage extends UIMessage = UIMessage> = Omit<
  ChatUiProps<TUiMessage>['messagesProps'],
  | 'messages'
  | 'tools'
  | 'indexUiState'
  | 'setIndexUiState'
  | 'scrollRef'
  | 'contentRef'
  | 'onClose'
  | 'onReload'
  | 'messageComponent'
  | 'leadingComponent'
  | 'footerComponent'
  | 'suggestionsComponent'
  | 'translations'
  | 'classNames'
>;

type UserPromptProps = Omit<
  ChatUiProps['promptProps'],
  'value' | 'onInput' | 'onSubmit' | 'headerComponent' | 'footerComponent'
>;

export type Tool = UserClientSideTool;
export type Tools = UserClientSideTools;

export type ChatProps<TObject, TUiMessage extends UIMessage = UIMessage> = Omit<
  ChatUiProps,
  keyof UiProps | 'ref'
> &
  UseChatProps<TUiMessage> & {
    itemComponent?: ItemComponent<TObject>;
    tools?: UserClientSideTools;
    getSearchPageURL?: (nextUiState: IndexUiState) => string;
    headerProps?: UserHeaderProps;
    messagesProps?: UserMessagesProps<TUiMessage>;
    promptProps?: UserPromptProps;
    layoutComponent?: (props: ChatLayoutOwnProps) => JSX.Element;
    headerComponent?: ChatUiProps['headerComponent'];
    headerTitleIconComponent?: ChatUiProps['headerProps']['titleIconComponent'];
    headerCloseIconComponent?: ChatUiProps['headerProps']['closeIconComponent'];
    headerMinimizeIconComponent?: ChatUiProps['headerProps']['minimizeIconComponent'];
    headerMaximizeIconComponent?: ChatUiProps['headerProps']['maximizeIconComponent'];
    messagesErrorComponent?: ChatUiProps['messagesProps']['errorComponent'];
    promptComponent?: ChatUiProps['promptComponent'];
    promptHeaderComponent?: ChatUiProps['promptProps']['headerComponent'];
    promptFooterComponent?: ChatUiProps['promptProps']['footerComponent'];
    loaderComponent?: ChatUiProps['messagesProps']['loaderComponent'];
    /**
     * Where the loader renders: as its own row after the last message
     * (`messages-end`, the default) or inside the streaming assistant message
     * (`message-inline`).
     */
    loaderPosition?: ChatUiProps['messagesProps']['loaderPosition'];
    /**
     * Overrides when the loader shows. Receives the turn context plus the
     * built-in decision as `defaultValue`.
     */
    shouldShowLoader?: ChatUiProps['messagesProps']['shouldShowLoader'];
    /**
     * How long (ms) a renewed loading state must hold before the loader comes
     * back after having been hidden in the same turn.
     */
    loaderShowDelay?: ChatUiProps['messagesProps']['loaderShowDelay'];
    /**
     * Minimum time (ms) the loader stays on screen once shown, while the turn is
     * still running.
     */
    loaderMinDuration?: ChatUiProps['messagesProps']['loaderMinDuration'];
    emptyComponent?: ChatUiProps['messagesProps']['emptyComponent'];
    actionsComponent?: ChatUiProps['messagesProps']['actionsComponent'];
    assistantMessageLeadingComponent?: ChatMessageProps['leadingComponent'];
    assistantMessageFooterComponent?: ChatMessageProps['footerComponent'];
    userMessageLeadingComponent?: ChatMessageProps['leadingComponent'];
    userMessageFooterComponent?: ChatMessageProps['footerComponent'];
    suggestionsComponent?: ChatUiProps['suggestionsComponent'];
    /**
     * Whether to render reasoning parts
     */
    showReasoning?: boolean;
    /**
     * Custom reasoning renderer
     */
    reasoningComponent?: ChatMessageProps<TUiMessage>['reasoningComponent'];
    translations?: Partial<{
      prompt: ChatUiProps['promptProps']['translations'];
      header: ChatUiProps['headerProps']['translations'];
      message: ChatUiProps['messagesProps']['messageTranslations'];
      messages: ChatUiProps['messagesProps']['translations'];
    }>;
  };

export type ChatHandle = {
  setOpen: (open: boolean) => void;
  sendMessage: (params: { text: string }) => void;
  setInput: (input: string) => void;
};

type AnimationSnapshotProps = {
  promptRef: React.RefObject<HTMLTextAreaElement | null>;
  animationsBeforeReveal: React.RefObject<ContainerAnimationSnapshot>;
  open: boolean;
};

class AnimationSnapshot extends React.Component<AnimationSnapshotProps> {
  getSnapshotBeforeUpdate() {
    return getActiveContainerAnimations(this.props.promptRef.current);
  }

  componentDidUpdate(
    _previousProps: AnimationSnapshotProps,
    _previousState: unknown,
    animationsBeforeReveal: ContainerAnimationSnapshot
  ) {
    this.props.animationsBeforeReveal.current = animationsBeforeReveal;
    if (!_previousProps.open && this.props.open) {
      holdContainerInertUntilReveal(this.props.promptRef.current);
    } else if (this.props.open) {
      restoreContainerInertUntilReveal(this.props.promptRef.current);
    }
  }

  render() {
    return null;
  }
}

function ChatInner<
  TObject extends RecordWithObjectID,
  TUiMessage extends UIMessage,
>(
  {
    tools: userTools,
    headerProps,
    messagesProps,
    promptProps,
    itemComponent,
    layoutComponent,
    headerComponent,
    headerTitleIconComponent,
    headerCloseIconComponent,
    headerMinimizeIconComponent,
    headerMaximizeIconComponent,
    loaderComponent,
    loaderPosition,
    shouldShowLoader,
    loaderShowDelay,
    loaderMinDuration,
    messagesErrorComponent,
    promptComponent,
    promptHeaderComponent,
    promptFooterComponent,
    assistantMessageLeadingComponent,
    assistantMessageFooterComponent,
    userMessageLeadingComponent,
    userMessageFooterComponent,
    emptyComponent,
    actionsComponent,
    suggestionsComponent,
    classNames,
    translations = {},
    title,
    getSearchPageURL,
    disableTriggerValidation = false,
    showReasoning,
    reasoningComponent,
    ...props
  }: ChatProps<TObject, TUiMessage>,
  ref: React.ForwardedRef<ChatHandle>
) {
  const {
    prompt: promptTranslations,
    header: headerTranslations,
    message: messageTranslations,
    messages: messagesTranslations,
  } = translations;

  const { indexUiState, setIndexUiState } = useInstantSearch();

  const [maximized, setMaximized] = useState(false);

  const promptRef = useRef<HTMLTextAreaElement>(null);
  const focusRequestId = useRef(0);
  const animationsBeforeReveal = useRef<ContainerAnimationSnapshot>([]);

  const { scrollRef, contentRef, scrollToBottom, isAtBottom } =
    useStickToBottom({
      initial: 'smooth',
      resize: 'smooth',
    });

  const tools = useMemo(() => {
    const defaults = createDefaultTools(itemComponent, getSearchPageURL);

    return mergeToolOptions(defaults, userTools);
  }, [getSearchPageURL, itemComponent, userTools]);

  // Inline layouts are always visible, so they don't require a `<ChatTrigger />`
  // (or AI mode) to be present. We detect this via a `$$inlineLayout` marker
  // set on the layout component, which is consistent across flavors.
  const isInlineLayoutComponent =
    typeof layoutComponent === 'function' &&
    (layoutComponent as { $$inlineLayout?: true }).$$inlineLayout === true;
  const effectiveDisableTriggerValidation =
    disableTriggerValidation || isInlineLayoutComponent;

  const chatState = useChat<TUiMessage>({
    ...props,
    tools,
    disableTriggerValidation: effectiveDisableTriggerValidation,
  });

  const {
    messages,
    sendMessage,
    status,
    regenerate,
    stop,
    error,
    input,
    setInput,
    open,
    setOpen,
    clearMessages,
    tools: toolsFromConnector,
    suggestions,
    suggestionsStatus,
    sendChatMessageFeedback: onFeedback,
    feedbackState,
    '~consumeInputFocus': consumeInputFocus,
    '~isOpenStatePersistenceEnabled': isOpenStatePersistenceEnabled,
  } = chatState as typeof chatState & {
    '~consumeInputFocus'?: () => boolean;
    '~isOpenStatePersistenceEnabled'?: boolean;
  };

  const sendMessageAndScrollToBottom = useCallback<typeof sendMessage>(
    (...args) => {
      scrollToBottom();
      return sendMessage(...args);
    },
    [scrollToBottom, sendMessage]
  );

  useImperativeHandle(ref, () => ({
    setOpen,
    sendMessage: (params: { text: string }) =>
      sendMessageAndScrollToBottom(params),
    setInput,
  }));

  useEffect(() => {
    if (!open) {
      focusRequestId.current++;
      return;
    }

    if (consumeInputFocus?.()) {
      const currentFocusRequestId = ++focusRequestId.current;
      const previousAnimations = animationsBeforeReveal.current;
      holdContainerInertUntilReveal(promptRef.current);
      window.requestAnimationFrame(() => {
        const prompt = promptRef.current;
        focusAfterReveal(
          prompt,
          previousAnimations,
          () => {
            return (
              focusRequestId.current === currentFocusRequestId &&
              promptRef.current === prompt
            );
          },
          () => {
            return focusRequestId.current === currentFocusRequestId;
          }
        );
      });
    }
  });

  // Keep the conversation pinned to the bottom while streaming. The stick-to-
  // bottom ResizeObserver only reacts to content *height* changes, but tool
  // results such as a horizontally-growing carousel stream in without changing
  // height — so we also re-pin on every message/status update. Passing
  // `preserveScrollPosition` reuses the existing "only if already at the
  // bottom" gate, so this never fights a user who has scrolled up to read.
  useEffect(() => {
    if (status === 'streaming' || status === 'submitted') {
      scrollToBottom({ preserveScrollPosition: true });
    }
  }, [messages, status, scrollToBottom]);

  if (__DEV__ && error) {
    throw error;
  }

  const {
    assistantMessageProps: callerAssistantMessageProps,
    userMessageProps: callerUserMessageProps,
    ...restMessagesProps
  } = messagesProps ?? {};

  const chat = (
    <ChatUiComponent
      title={title}
      open={open}
      maximized={maximized}
      sendMessage={sendMessageAndScrollToBottom as ChatUiProps['sendMessage']}
      regenerate={regenerate}
      stop={stop}
      error={error}
      layoutComponent={layoutComponent}
      headerComponent={headerComponent}
      promptComponent={promptComponent}
      suggestionsComponent={suggestionsComponent}
      headerProps={{
        onClose: () => setOpen(false),
        maximized,
        onToggleMaximize: () => setMaximized(!maximized),
        onClear: clearMessages,
        canClear: Boolean(messages?.length),
        titleIconComponent: headerTitleIconComponent,
        closeIconComponent: headerCloseIconComponent,
        minimizeIconComponent: headerMinimizeIconComponent,
        maximizeIconComponent: headerMaximizeIconComponent,
        translations: headerTranslations,
        ...headerProps,
      }}
      messagesProps={{
        status,
        onReload: (messageId) => regenerate({ messageId }),
        onNewConversation: clearMessages,
        onClose: () => setOpen(false),
        sendMessage: sendMessageAndScrollToBottom as ChatUiProps['sendMessage'],
        setInput,
        onFeedback,
        feedbackState,
        messages,
        tools: toolsFromConnector,
        indexUiState,
        setIndexUiState,
        isScrollAtBottom: isAtBottom,
        scrollRef,
        contentRef,
        onScrollToBottom: scrollToBottom,
        loaderComponent,
        loaderPosition,
        shouldShowLoader,
        loaderShowDelay,
        loaderMinDuration,
        errorComponent: messagesErrorComponent,
        emptyComponent: emptyComponent,
        actionsComponent,
        translations: messagesTranslations,
        messageTranslations,
        // The message props merge key by key rather than replace, so the dedicated
        // top-level props still apply for keys the caller leaves unset. Spread
        // explicitly so the merge does not depend on key order in the literal.
        ...restMessagesProps,
        assistantMessageProps: {
          leadingComponent: assistantMessageLeadingComponent,
          footerComponent: assistantMessageFooterComponent,
          showReasoning,
          reasoningComponent,
          ...callerAssistantMessageProps,
        },
        userMessageProps: {
          leadingComponent: userMessageLeadingComponent,
          footerComponent: userMessageFooterComponent,
          ...callerUserMessageProps,
        },
        error,
      }}
      promptProps={{
        promptRef,
        status,
        value: input,
        translations: promptTranslations,
        onInput: (event) => {
          setInput((event.currentTarget as HTMLInputElement).value);
        },
        onSubmit: () => {
          sendMessageAndScrollToBottom({ text: input });
          setInput('');
        },
        onStop: () => {
          stop();
        },
        headerComponent: promptHeaderComponent,
        footerComponent: promptFooterComponent,
        ...promptProps,
        autoFocus:
          promptProps?.autoFocus ??
          (!isOpenStatePersistenceEnabled || isInlineLayoutComponent),
      }}
      suggestionsProps={{
        suggestions,
        isLoading: suggestionsStatus === 'loading',
        onSuggestionClick: (suggestion) => {
          sendMessageAndScrollToBottom({ text: suggestion });
        },
      }}
      classNames={classNames}
    />
  );

  return (
    <>
      <AnimationSnapshot
        promptRef={promptRef}
        animationsBeforeReveal={animationsBeforeReveal}
        open={open}
      />
      {chat}
    </>
  );
}

export const Chat = React.forwardRef(ChatInner) as <
  TObject extends RecordWithObjectID = RecordWithObjectID,
  TUiMessage extends UIMessage = UIMessage,
>(
  props: ChatProps<TObject, TUiMessage> & { ref?: React.Ref<ChatHandle> }
) => React.ReactElement | null;
