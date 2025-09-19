import { createChatComponent } from 'instantsearch-ui-components';
import {
  defaultTools,
  SearchIndexToolType,
} from 'instantsearch.js/es/lib/chat';
import { find } from 'instantsearch.js/es/lib/utils';
import React, { createElement, Fragment } from 'react';
import { useInstantSearch, useChat } from 'react-instantsearch-core';

import { Carousel } from '../components';
import { useStickToBottom } from '../ui/lib/useStickToBottom';

import type {
  Pragma,
  ChatProps as ChatUiProps,
  RecommendComponentProps,
  RecordWithObjectID,
  AddToolResultWithOutput,
  UserClientSideTool,
  MutableRef,
} from 'instantsearch-ui-components';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';
import type { UseChatOptions } from 'react-instantsearch-core';

const ChatUiComponent = createChatComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function createDefaultTools<TObject extends RecordWithObjectID>(
  itemComponent?: ItemComponent<TObject>
): UserClientSideTool[] {
  return [
    {
      type: SearchIndexToolType,
      component: ({ message, indexUiState, setIndexUiState }) => {
        const items =
          (
            message.output as {
              hits?: Array<RecordWithObjectID<TObject>>;
            }
          )?.hits || [];

        const input = message.input as { query: string };

        return (
          <div>
            <Carousel
              items={items}
              itemComponent={itemComponent}
              sendEvent={() => {}}
            />

            {input?.query && (
              <button
                className="ais-ChatToolSearchIndexRefineButton"
                onClick={() => {
                  if (input?.query) {
                    setIndexUiState({
                      ...indexUiState,
                      query: input.query,
                    });
                  }
                }}
              >
                Refine on this query
              </button>
            )}
          </div>
        );
      },
    },
  ];
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
  'messages' | 'tools' | 'indexUiState' | 'setIndexUiState'
>;

type UserPromptProps = Omit<
  ChatUiProps['promptProps'],
  'value' | 'onInput' | 'onSubmit'
>;

export type ChatProps<TObject, TUiMessage extends UIMessage = UIMessage> = Omit<
  ChatUiProps,
  keyof UiProps
> & {
  itemComponent?: ItemComponent<TObject>;
  tools?: UserClientSideTool[];
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
  toggleButtonProps,
  headerProps,
  messagesProps,
  promptProps,
  classNames,
  resume,
  ...options
}: ChatProps<TObject, TUiMessage>) {
  const { indexUiState, setIndexUiState } = useInstantSearch();

  const [open, setOpen] = React.useState(false);
  const [maximized, setMaximized] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [isClearing, setIsClearing] = React.useState(false);

  const { scrollRef, contentRef, isAtBottom, scrollToBottom } =
    useStickToBottom({
      initial: 'instant',
      resize: 'smooth',
    });

  const tools = React.useMemo(() => {
    const defaults = createDefaultTools(itemComponent);

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
  }, [itemComponent, userTools]);

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
    resume,
    ...options,
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
    if (messages.length === 0) return;
    setIsClearing(true);
  }, [messages.length]);

  const handleClearTransitionEnd = React.useCallback(() => {
    setMessages([]);
    clearError();
    setIsClearing(false);
  }, [setMessages, clearError]);

  return (
    <ChatUiComponent
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
        canClear: messages.length > 0 && !isClearing,
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
        scrollRef: scrollRef as unknown as MutableRef<HTMLDivElement>,
        contentRef: contentRef as unknown as MutableRef<HTMLDivElement>,
        isScrollAtBottom: isAtBottom,
        onScrollToBottom: scrollToBottom,
        ...messagesProps,
      }}
      promptProps={{
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
