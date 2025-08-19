import { DefaultChatTransport } from 'ai';
import { createChatComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useChat } from 'react-instantsearch-core';

import type { Pragma } from 'instantsearch-ui-components';

const ChatUiComponent = createChatComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export type ChatProps = {
  agentId: string;
};

export function Chat({ agentId }: ChatProps) {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: `https://generative-eu.algolia.com/1/agents/${agentId}/completions?stream=true&compatibilityMode=ai-sdk-5`,
      headers: {
        'x-algolia-application-id': 'F4T6CUV2AH',
        'X-Algolia-API-Key': '93aba0bf5908533b213d93b2410ded0c',
      },
    }),
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
