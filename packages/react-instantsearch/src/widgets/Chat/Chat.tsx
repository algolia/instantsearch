import { DefaultChatTransport } from 'ai';
import { createChatComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useChat, useInstantSearch } from 'react-instantsearch-core';

import type { Pragma, Tools } from 'instantsearch-ui-components';
import { Carousel } from '../../components';

const ChatUiComponent = createChatComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export type ChatProps = {
  agentId: string;
  itemComponent?: (props: { item: Record<string, unknown> }) => JSX.Element;
  tools?: Tools;
};

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

export function Chat({ agentId, tools: userTools, itemComponent }: ChatProps) {
  const { indexUiState, setIndexUiState } = useInstantSearch();

  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState('');

  const tools = React.useMemo(() => {
    return [...createDefaultTools(itemComponent), ...(userTools ?? [])];
  }, [userTools]);

  const { messages, sendMessage } = useChat({
    // TODO: loading indicator
    // TODO: override transport here from props
    transport: new DefaultChatTransport({
      // api: `https://generative-eu.algolia.com/1/agents/${agentId}/completions?stream=true&compatibilityMode=ai-sdk-5`,
      api: `https://agent-studio-staging.eu.algolia.com/1/agents/${agentId}/completions?stream=true&compatibilityMode=ai-sdk-5`,
      headers: {
        'x-algolia-application-id': 'F4T6CUV2AH',
        'X-Algolia-API-Key': '93aba0bf5908533b213d93b2410ded0c',
      },
    }),
    onToolCall: (params) => {
      tools?.forEach((tool) => {
        if (tool.type === params.toolCall.toolName) {
          tool.onToolCall?.(params.toolCall);
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
