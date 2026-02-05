import {
  SearchIndexToolType,
  RecommendToolType,
  MemorizeToolType,
  MemorySearchToolType,
  PonderToolType,
} from 'instantsearch-core';
import { createChatComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useInstantSearch, useChat } from 'react-instantsearch-core';

import { useStickToBottom } from '../lib/useStickToBottom';

import { createCarouselTool } from './chat/tools/SearchIndexTool';

export {
  SearchIndexToolType,
  RecommendToolType,
  MemorizeToolType,
  MemorySearchToolType,
  PonderToolType,
};

import type { IndexUiState, UIMessage } from 'instantsearch-core';
import type {
  Pragma,
  ChatProps as ChatUiProps,
  RecommendComponentProps,
  RecordWithObjectID,
  UserClientSideTool,
  UserClientSideTools,
  ChatMessageProps,
} from 'instantsearch-ui-components';
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
  | 'toggleButtonProps'
  | 'messagesProps'
  | 'promptProps'
  | 'suggestionsProps'
  | 'headerComponent'
  | 'promptComponent'
  | 'suggestionsComponent'
>;

type UserToggleButtonProps = Omit<
  ChatUiProps['toggleButtonProps'],
  'open' | 'onClick'
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
  keyof UiProps
> &
  UseChatProps<TUiMessage> & {
    itemComponent?: ItemComponent<TObject>;
    tools?: UserClientSideTools;
    getSearchPageURL?: (nextUiState: IndexUiState) => string;
    toggleButtonProps?: UserToggleButtonProps;
    headerProps?: UserHeaderProps;
    messagesProps?: UserMessagesProps;
    promptProps?: UserPromptProps;
    toggleButtonComponent?: ChatUiProps['toggleButtonComponent'];
    toggleButtonIconComponent?: ChatUiProps['toggleButtonProps']['toggleIconComponent'];
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

export function Chat<
  TObject extends RecordWithObjectID,
  TUiMessage extends UIMessage
>({
  tools: userTools,
  toggleButtonProps,
  headerProps,
  messagesProps,
  promptProps,
  itemComponent,
  toggleButtonComponent,
  toggleButtonIconComponent,
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
  ...props
}: ChatProps<TObject, TUiMessage>) {
  const {
    prompt: promptTranslations,
    header: headerTranslations,
    message: messageTranslations,
    messages: messagesTranslations,
  } = translations;

  const { indexUiState, setIndexUiState } = useInstantSearch();

  const [maximized, setMaximized] = React.useState(false);

  const promptRef = React.useRef<HTMLTextAreaElement>(null);

  const { scrollRef, contentRef, scrollToBottom, isAtBottom } =
    useStickToBottom({
      initial: 'smooth',
      resize: 'smooth',
    });

  const tools = React.useMemo(() => {
    const defaults = createDefaultTools(itemComponent, getSearchPageURL);

    return { ...defaults, ...userTools };
  }, [getSearchPageURL, itemComponent, userTools]);

  const chatState = useChat<TUiMessage>({
    ...props,
    tools,
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
  } = chatState;

  if (__DEV__ && error) {
    throw error;
  }

  return (
    <ChatUiComponent
      title={title}
      open={open}
      maximized={maximized}
      headerComponent={headerComponent}
      promptComponent={promptComponent}
      toggleButtonComponent={toggleButtonComponent}
      suggestionsComponent={suggestionsComponent}
      toggleButtonProps={{
        open,
        onClick: () => setOpen(!open),
        toggleIconComponent: toggleButtonIconComponent,
        ...toggleButtonProps,
      }}
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
        messages,
        tools: toolsFromConnector as any,
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
