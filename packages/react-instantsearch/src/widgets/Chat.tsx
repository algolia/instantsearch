import { createChatComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useInstantSearch, useChat } from 'react-instantsearch-core';

import { createSearchIndexTool } from './chat/tools/SearchIndexTool';

export { SearchIndexToolType } from './chat/tools/SearchIndexTool';

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
  return { ...createSearchIndexTool(itemComponent, getSearchPageURL) };
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
export type Tools = UserClientSideTools;

export type ChatProps<TObject, TUiMessage extends UIMessage = UIMessage> = Omit<
  ChatUiProps,
  keyof UiProps
> & {
  itemComponent?: ItemComponent<TObject>;
  tools?: UserClientSideTools;
  defaultOpen?: boolean;
  getSearchPageURL?: (nextUiState: IndexUiState) => string;
} & UseChatOptions<TUiMessage> & {
    toggleButtonProps?: UserToggleButtonProps;
    headerProps?: UserHeaderProps;
    messagesProps?: UserMessagesProps;
    promptProps?: UserPromptProps;
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
  title,
  getSearchPageURL,
  ...props
}: ChatProps<TObject, TUiMessage>) {
  const { indexUiState, setIndexUiState } = useInstantSearch();

  const [open, setOpen] = React.useState(defaultOpen);
  const [maximized, setMaximized] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [isClearing, setIsClearing] = React.useState(false);
  const [isScrollAtBottom, setIsScrollAtBottom] = React.useState(true);

  const promptRef = React.useRef<HTMLTextAreaElement>(null);

  const tools = React.useMemo(() => {
    const defaults = createDefaultTools(itemComponent, getSearchPageURL);

    if (!userTools) {
      return defaults;
    }

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
  } = useChat({
    ...props,
    onToolCall: ({ toolCall }) => {
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
        canClear: Boolean(messages?.length) && !isClearing,
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
        ...messagesProps,
      }}
      promptProps={{
        promptRef,
        status,
        value: input,
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
