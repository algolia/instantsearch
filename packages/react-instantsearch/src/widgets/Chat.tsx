import { createChatComponent } from 'instantsearch-ui-components';
import { defaultTools } from 'instantsearch.js/es/lib/chat';
import { find } from 'instantsearch.js/es/lib/utils';
import React, { createElement, Fragment } from 'react';
import { useInstantSearch, useChat } from 'react-instantsearch-core';

import { createSearchIndexTool } from './chat/tools/SearchIndexTool';

export { SearchIndexToolType } from './chat/tools/SearchIndexTool';

import type {
  Pragma,
  ChatProps as ChatUiProps,
  RecommendComponentProps,
  RecordWithObjectID,
} from 'instantsearch-ui-components';
import type {
  AddToolResultWithOutput,
  UserClientSideTool,
} from 'instantsearch-ui-components/src/components/chat/types';
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
): UserClientSideTool[] {
  return [createSearchIndexTool(itemComponent, getSearchPageURL)];
}

type ItemComponent<TObject> = RecommendComponentProps<TObject>['itemComponent'];

type UiProps = Pick<
  ChatUiProps,
  'open' | 'headerProps' | 'toggleButtonProps' | 'messagesProps' | 'promptProps'
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
  'value' | 'onInput' | 'onSubmit'
>;

export type Tool = UserClientSideTool;

export type ChatProps<TObject, TUiMessage extends UIMessage = UIMessage> = Omit<
  ChatUiProps,
  keyof UiProps
> & {
  itemComponent?: ItemComponent<TObject>;
  tools?: UserClientSideTool[];
  defaultOpen?: boolean;
  getSearchPageURL?: (nextUiState: IndexUiState) => string;
} & UseChatOptions<TUiMessage> & {
    toggleButtonProps?: UserToggleButtonProps;
    headerProps?: UserHeaderProps;
    messagesProps?: UserMessagesProps;
    promptProps?: UserPromptProps;
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
  itemComponent,
  defaultOpen = false,
  toggleButtonProps,
  headerProps,
  messagesProps,
  promptProps,
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

  const tools = React.useMemo(() => {
    const defaults = createDefaultTools(itemComponent, getSearchPageURL);

    if (!userTools) {
      return defaults;
    }

    const userToolsMap = new Map(userTools.map((tool) => [tool.type, tool]));

    const merged = defaults.map(
      (defaultTool) => userToolsMap.get(defaultTool.type) ?? defaultTool
    );

    const extraUserTools = userTools.filter(
      (tool) => !defaultTools.includes(tool.type)
    );

    return [...merged, ...extraUserTools];
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
  } = useChat({
    ...props,
    onToolCall: ({ toolCall }) => {
      const tool = find(tools, (t) => t.type === `tool-${toolCall.toolName}`);

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
        tool.onToolCall({ addToolResult: scopedAddToolResult });
      }
    },
  });

  const toolsForUi = React.useMemo(
    () =>
      tools?.map((t) => ({
        ...t,
        addToolResult,
      })),
    [tools, addToolResult]
  );

  const handleClear = React.useCallback(() => {
    if (!messages || messages.length === 0) return;
    setIsClearing(true);
  }, [messages]);

  const handleClearTransitionEnd = React.useCallback(() => {
    setMessages([]);
    clearError();
    setIsClearing(false);
  }, [setMessages, clearError]);

  return (
    <ChatUiComponent
      title={title}
      open={open}
      maximized={maximized}
      toggleButtonProps={{
        open,
        onClick: () => setOpen(!open),
        ...toggleButtonProps,
      }}
      headerProps={{
        onClose: () => setOpen(false),
        maximized,
        onToggleMaximize: () => setMaximized(!maximized),
        onClear: handleClear,
        canClear: messages && messages.length > 0 && !isClearing,
        translations: headerTranslations,
        ...headerProps,
      }}
      messagesProps={{
        status,
        onReload: (messageId) => regenerate({ messageId }),
        messages,
        tools: toolsForUi,
        indexUiState,
        setIndexUiState,
        isClearing,
        onClearTransitionEnd: handleClearTransitionEnd,
        isScrollAtBottom,
        setIsScrollAtBottom,
        translations: messagesTranslations,
        ...messagesProps,
      }}
      promptProps={{
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
        ...promptProps,
      }}
      classNames={classNames}
    />
  );
}
