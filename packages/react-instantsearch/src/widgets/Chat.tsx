import { lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { createChatComponent } from 'instantsearch-ui-components';
import {
  SearchIndexToolType,
  RecommendToolType,
} from 'instantsearch.js/es/lib/chat';
import React, { createElement, Fragment } from 'react';
import { useInstantSearch, useChat } from 'react-instantsearch-core';

import { createCarouselTool } from './chat/tools/SearchIndexTool';

export { SearchIndexToolType, RecommendToolType };

import type {
  Pragma,
  ChatProps as ChatUiProps,
  RecommendComponentProps,
  RecordWithObjectID,
  AddToolResultWithOutput,
  UserClientSideTool,
  UserClientSideTools,
  ClientSideTools,
} from 'instantsearch-ui-components';
import type { IndexUiState } from 'instantsearch.js';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';
import type { UseChatOptions } from 'react-instantsearch-core';

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
  | 'headerComponent'
  | 'promptComponent'
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
  UseChatOptions<TUiMessage> & {
    itemComponent?: ItemComponent<TObject>;
    tools?: UserClientSideTools;
    defaultOpen?: boolean;
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
    translations?: Partial<{
      prompt: ChatUiProps['promptProps']['translations'];
      header: ChatUiProps['headerProps']['translations'];
      messages: ChatUiProps['messagesProps']['translations'];
    }>;
  };

export function Chat<
  TObject extends RecordWithObjectID,
  TUiMessage extends UIMessage
>({
  tools: userTools,
  defaultOpen = false,
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
  actionsComponent,
  classNames,
  translations = {},
  title,
  getSearchPageURL,
  ...props
}: ChatProps<TObject, TUiMessage>) {
  const {
    prompt: promptTranslations,
    header: headerTranslations,
    messages: messagesTranslations,
  } = translations;

  const { indexUiState, setIndexUiState } = useInstantSearch();

  const [open, setOpen] = React.useState(defaultOpen);
  const [maximized, setMaximized] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [isClearing, setIsClearing] = React.useState(false);
  const [isScrollAtBottom, setIsScrollAtBottom] = React.useState(true);

  const promptRef = React.useRef<HTMLTextAreaElement>(null);

  const tools = React.useMemo(() => {
    const defaults = createDefaultTools(itemComponent, getSearchPageURL);

    return { ...defaults, ...userTools };
  }, [getSearchPageURL, itemComponent, userTools]);

  const {
    messages,
    sendMessage,
    addToolResult,
    status,
    regenerate,
    stop,
    setMessages,
    clearError,
    error,
  } = useChat({
    ...props,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall({ toolCall }) {
      const tool = tools[toolCall.toolName];

      if (tool && tool.onToolCall) {
        const scopedAddToolResult: AddToolResultWithOutput = ({ output }) => {
          return Promise.resolve(
            addToolResult({
              output,
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
            })
          );
        };
        tool.onToolCall({ ...toolCall, addToolResult: scopedAddToolResult });
      } else {
        if (__DEV__) {
          throw new Error(
            `No tool implementation found for "${toolCall.toolName}". Please provide a tool implementation in the \`tools\` prop.`
          );
        }

        addToolResult({
          output: `No tool implemented for "${toolCall.toolName}".`,
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
        });
      }
    },
  });

  const toolsForUi: ClientSideTools = React.useMemo(() => {
    const result: ClientSideTools = {};
    Object.entries(tools).forEach(([key, tool]) => {
      result[key] = {
        ...tool,
        addToolResult,
      };
    });
    return result;
  }, [tools, addToolResult]);

  const handleClear = React.useCallback(() => {
    if (!messages || messages.length === 0) return;
    setIsClearing(true);
  }, [messages]);

  const handleClearTransitionEnd = React.useCallback(() => {
    setMessages([]);
    clearError();
    setIsClearing(false);
  }, [setMessages, clearError]);

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
        onClear: handleClear,
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
        tools: toolsForUi,
        indexUiState,
        setIndexUiState,
        isClearing,
        onClearTransitionEnd: handleClearTransitionEnd,
        isScrollAtBottom,
        setIsScrollAtBottom,
        loaderComponent: messagesLoaderComponent,
        errorComponent: messagesErrorComponent,
        actionsComponent,
        translations: messagesTranslations,
        ...messagesProps,
      }}
      promptProps={{
        promptRef,
        status,
        value: input,
        translations: promptTranslations,
        // Explicit event type is required to prevent TypeScript error
        // where parameter would implicitly have 'any' type without type annotation
        onInput: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
          setInput(event.currentTarget.value);
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
      classNames={classNames}
    />
  );
}
