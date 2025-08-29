import { useChat } from '@ai-sdk/react';
import { createChatComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type { Pragma } from 'instantsearch-ui-components';

const ChatUiComponent = createChatComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export type ChatProps = {
  token: string;
};

export function Chat({ token }: ChatProps) {
  const [open, setOpen] = React.useState(false);
  const { messages, handleSubmit, input, setInput } = useChat({
    api: `https://askai.algolia.com/chat`,
    headers: {
      'Content-Type': 'application/json',
      'X-Algolia-Application-Id': 'PMZUYBQDAK',
      'X-Algolia-API-Key': '24b09689d5b4223813d9b8e48563c8f6',
      'X-Algolia-Index-Name': 'docsearch-markdown',
      'X-Algolia-Assistant-Id': 'askAIDemo',
      Authorization: `TOKEN ${token}`,
    },
    experimental_prepareRequestBody: (body) => body,
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
        onSubmit: () => {
          handleSubmit();
        },
      }}
    />
  );
}
