import { createChatComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useInstantSearch, useChat } from 'react-instantsearch-core';

import { Carousel } from '../components';

import type {
  Pragma,
  ChatProps as ChatUiProps,
  RecommendComponentProps,
  RecordWithObjectID,
  ClientSideTool,
  ChatToolType,
} from 'instantsearch-ui-components';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';
import type { UseChatOptions } from 'react-instantsearch-core';

const ChatUiComponent = createChatComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export const defaultTools: ChatToolType[] = ['tool-algolia_search_index'];

export const SearchIndexToolType: ChatToolType = 'tool-algolia_search_index';

export function createDefaultTools<TObject extends RecordWithObjectID>(
  itemComponent?: ItemComponent<TObject>
): ClientSideTool[] {
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
      onToolCall: ({ toolCall, addToolResult }) => {
        addToolResult({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: '',
        });
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
  tools?: ClientSideTool[];
} & UseChatOptions<TUiMessage> & {
    toggleButtonProps?: UserToggleButtonProps;
    headerProps?: UserHeaderProps;
    messagesProps?: UserMessagesProps;
    promptProps?: UserPromptProps;
  };

export function Chat<TObject extends RecordWithObjectID>({
  tools: userTools,
  itemComponent,
  toggleButtonProps,
  headerProps,
  messagesProps,
  promptProps,
  classNames,
  resume,
  ...options
}: ChatProps<TObject>) {
  const { indexUiState, setIndexUiState } = useInstantSearch();

  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState('');

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

  const { messages, sendMessage, addToolResult } = useChat({
    resume,
    ...options,
    onToolCall: ({ toolCall }) => {
      tools?.forEach((tool) => {
        tool.onToolCall({ toolCall, addToolResult });
      });
    },
  });

  return (
    <ChatUiComponent
      open={open}
      toggleButtonProps={{
        open,
        onClick: () => setOpen(!open),
        ...toggleButtonProps,
      }}
      messagesProps={{
        messages,
        tools,
        indexUiState,
        setIndexUiState,
        ...messagesProps,
      }}
      headerProps={{
        onClose: () => setOpen(false),
        ...headerProps,
      }}
      promptProps={{
        value: input,
        onInput: (event) => {
          setInput(event);
        },
        onSubmit: (event) => {
          sendMessage({ text: event });
          setInput('');
        },
        ...promptProps,
      }}
      classNames={classNames}
    />
  );
}
