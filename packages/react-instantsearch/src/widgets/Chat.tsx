import { createChatComponent } from 'instantsearch-ui-components';
import {
  SearchIndexToolType,
  RecommendToolType,
  MemorizeToolType,
  MemorySearchToolType,
  PonderToolType,
} from 'instantsearch.js/es/lib/chat';
import React, {
  createElement,
  Fragment,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useInstantSearch, useChat } from 'react-instantsearch-core';

import { ChatInlineLayout } from '../components/ChatInlineLayout';
import { useStickToBottom } from '../lib/useStickToBottom';

import { createCarouselTool } from './chat/tools/SearchIndexTool';

export {
  SearchIndexToolType,
  RecommendToolType,
  MemorizeToolType,
  MemorySearchToolType,
  PonderToolType,
};

import type {
  Pragma,
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
import type { UseChatProps } from 'react-instantsearch-core';

const ChatUiComponent = createChatComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function createDefaultTools<TObject extends RecordWithObjectID>(
  itemComponent?: ItemComponent<TObject>,
  getSearchPageURL?: (nextUiState: IndexUiState) => string
): UserClientSideTools {
  return {
    [SearchIndexToolType]: createCarouselTool(
      true,
      itemComponent,
      getSearchPageURL
    ),
    [RecommendToolType]: createCarouselTool(
      false,
      itemComponent,
      getSearchPageURL
    ),
    [MemorizeToolType]: {},
    [MemorySearchToolType]: {},
    [PonderToolType]: {},
  };
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

type UserMessagesProps = Omit<
  ChatUiProps['messagesProps'],
  | 'messages'
  | 'tools'
  | 'indexUiState'
  | 'setIndexUiState'
  | 'scrollRef'
  | 'contentRef'
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
    messagesProps?: UserMessagesProps;
    promptProps?: UserPromptProps;
    layoutComponent?: (props: ChatLayoutOwnProps) => JSX.Element;
    headerComponent?: ChatUiProps['headerComponent'];
    headerTitleIconComponent?: ChatUiProps['headerProps']['titleIconComponent'];
    headerCloseIconComponent?: ChatUiProps['headerProps']['closeIconComponent'];
    headerMinimizeIconComponent?: ChatUiProps['headerProps']['minimizeIconComponent'];
    headerMaximizeIconComponent?: ChatUiProps['headerProps']['maximizeIconComponent'];
    messagesLoaderComponent?: ChatUiProps['messagesProps']['loaderComponent'];
    messagesErrorComponent?: ChatUiProps['messagesProps']['errorComponent'];
    promptComponent?: ChatUiProps['promptComponent'];
    promptHeaderComponent?: ChatUiProps['promptProps']['headerComponent'];
    promptFooterComponent?: ChatUiProps['promptProps']['footerComponent'];
    actionsComponent?: ChatUiProps['messagesProps']['actionsComponent'];
    assistantMessageLeadingComponent?: ChatMessageProps['leadingComponent'];
    assistantMessageFooterComponent?: ChatMessageProps['footerComponent'];
    userMessageLeadingComponent?: ChatMessageProps['leadingComponent'];
    userMessageFooterComponent?: ChatMessageProps['footerComponent'];
    suggestionsComponent?: ChatUiProps['suggestionsComponent'];
    translations?: Partial<{
      prompt: ChatUiProps['promptProps']['translations'];
      header: ChatUiProps['headerProps']['translations'];
      message: ChatUiProps['messagesProps']['messageTranslations'];
      messages: ChatUiProps['messagesProps']['translations'];
    }>;
  };

export type ChatHandle = {
  setOpen: (open: boolean) => void;
  getOpen?: () => boolean;
  sendMessage: (params: { text: string }) => void;
  setInput: (input: string) => void;
};

function ChatInner<
  TObject extends RecordWithObjectID,
  TUiMessage extends UIMessage
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
    messagesLoaderComponent,
    messagesErrorComponent,
    promptComponent,
    promptHeaderComponent,
    promptFooterComponent,
    assistantMessageLeadingComponent,
    assistantMessageFooterComponent,
    userMessageLeadingComponent,
    userMessageFooterComponent,
    actionsComponent,
    suggestionsComponent,
    classNames,
    translations = {},
    title,
    getSearchPageURL,
    disableTriggerValidation = false,
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

  const { scrollRef, contentRef, scrollToBottom, isAtBottom } =
    useStickToBottom({
      initial: 'smooth',
      resize: 'smooth',
    });

  const tools = useMemo(() => {
    const defaults = createDefaultTools(itemComponent, getSearchPageURL);

    return { ...defaults, ...userTools };
  }, [getSearchPageURL, itemComponent, userTools]);

  // Inline layout doesn't need a trigger — auto-exempt from validation.
  const effectiveDisableTriggerValidation =
    disableTriggerValidation || layoutComponent === ChatInlineLayout;

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
    isClearing,
    clearMessages,
    onClearTransitionEnd,
    tools: toolsFromConnector,
    suggestions,
    sendChatMessageFeedback: onFeedback,
    feedbackState,
  } = chatState;

  useImperativeHandle(ref, () => ({
    setOpen,
    getOpen: () => open,
    sendMessage: (params: { text: string }) => sendMessage(params),
    setInput,
  }));

  const wasOpenRef = useRef(false);
  useEffect(() => {
    const shouldFocusPrompt = !wasOpenRef.current && open;

    if (shouldFocusPrompt) {
      window.requestAnimationFrame(() => {
        promptRef.current?.focus();
      });
    }

    wasOpenRef.current = open;
  }, [open]);

  if (__DEV__ && error) {
    throw error;
  }

  return (
    <ChatUiComponent
      title={title}
      open={open}
      maximized={maximized}
      sendMessage={sendMessage as ChatUiProps['sendMessage']}
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
        canClear: Boolean(messages?.length) && !isClearing,
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
        onClose: () => setOpen(false),
        onFeedback,
        feedbackState,
        messages,
        tools: toolsFromConnector,
        indexUiState,
        setIndexUiState,
        isClearing,
        onClearTransitionEnd,
        isScrollAtBottom: isAtBottom,
        scrollRef,
        contentRef,
        onScrollToBottom: scrollToBottom,
        loaderComponent: messagesLoaderComponent,
        errorComponent: messagesErrorComponent,
        actionsComponent,
        assistantMessageProps: {
          leadingComponent: assistantMessageLeadingComponent,
          footerComponent: assistantMessageFooterComponent,
          ...messagesProps?.assistantMessageProps,
        },
        userMessageProps: {
          leadingComponent: userMessageLeadingComponent,
          footerComponent: userMessageFooterComponent,
          ...messagesProps?.userMessageProps,
        },
        translations: messagesTranslations,
        messageTranslations,
        ...messagesProps,
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
          sendMessage({ text: input });
          setInput('');
        },
        onStop: () => {
          stop();
        },
        headerComponent: promptHeaderComponent,
        footerComponent: promptFooterComponent,
        ...promptProps,
      }}
      suggestionsProps={{
        suggestions,
        onSuggestionClick: (suggestion) => {
          sendMessage({ text: suggestion });
        },
      }}
      classNames={classNames}
    />
  );
}

export const Chat = React.forwardRef(ChatInner) as <
  TObject extends RecordWithObjectID = RecordWithObjectID,
  TUiMessage extends UIMessage = UIMessage
>(
  props: ChatProps<TObject, TUiMessage> & { ref?: React.Ref<ChatHandle> }
) => React.ReactElement | null;
