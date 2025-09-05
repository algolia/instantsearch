import { createChatComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useInstantSearch } from 'react-instantsearch-core';
import { useChat } from 'react-instantsearch-core/src/lib/useChat';

import { Carousel } from '../components';

import type { Pragma, Tools } from 'instantsearch-ui-components';
import type { ChatTransport } from 'react-instantsearch-core/src/lib/useChat';

const ChatUiComponent = createChatComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const createDefaultTools = (
  itemComponent?: (props: { item: Record<string, unknown> }) => JSX.Element
): Tools => {
  return [
    {
      type: 'tool-algolia_search_index',
      component: ({ message }) => {
        const items =
          (
            message.output as {
              hits?: Array<{
                objectID: string;
                __position: number;
              }>;
            }
          )?.hits || [];

        return (
          <Carousel
            items={items}
            itemComponent={itemComponent}
            sendEvent={() => {}}
          />
        );
      },
    },
  ];
};

export type ChatProps = {
  itemComponent?: (props: { item: Record<string, unknown> }) => JSX.Element;
  tools?: Tools;
} & ChatTransport;

export function Chat({
  tools: userTools,
  agentId: userAgentId,
  transport: userTransport,
  itemComponent,
}: ChatProps) {
  const { indexUiState, setIndexUiState } = useInstantSearch();

  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState('');

  const tools = React.useMemo(() => {
    return [...createDefaultTools(itemComponent), ...(userTools ?? [])];
  }, [itemComponent, userTools]);

  const { messages, sendMessage } = useChat({
    agentId: userAgentId,
    transport: userTransport,
    onToolCall: (params) => {
      tools?.forEach((tool) => {
        if (tool.type === params.toolCall.toolName) {
          tool.onToolCall?.(params);
        }
      });
    },
  });

  return (
    <ChatUiComponent
      open={open}
      toggleButtonProps={{
        open,
        onClick: () => setOpen(!open),
      }}
      messagesProps={{
        messages,
        tools,
        indexUiState,
        setIndexUiState,
      }}
      headerProps={{
        onClose: () => setOpen(false),
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
      }}
    />
  );
}
