import { createChatComponent } from 'instantsearch-ui-components/src/components/chat/Chat';
import React, { createElement, Fragment } from 'react';
import { useChat } from 'react-instantsearch-core/src';

import type { ChatMessageBase } from './ChatMessages';
import type { Pragma } from 'instantsearch-ui-components';

const ChatUiComponent = createChatComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export type ChatProps = {
  agentId: string;
  renderMarkdown: (messages: ChatMessageBase[]) => ChatMessageBase[];
};

export function Chat({ agentId, renderMarkdown }: ChatProps) {
  const [open, setOpen] = React.useState(false);
  const {
    messages,
    setMessages,
    input,
    handleSubmit,
    setInput,
    status,
    stop,
    reload,
  } = useChat({
    api: `https://generative-eu.algolia.com/1/agents/${agentId}/completions?stream=true&compatibilityMode=ai-sdk-4`,
    headers: {
      'x-algolia-application-id': 'F4T6CUV2AH',
      'X-Algolia-API-Key': '93aba0bf5908533b213d93b2410ded0c',
    },
  });
  const renderedMessages = renderMarkdown(messages);

  return (
    <ChatUiComponent
      open={open}
      toggleButtonProps={{
        open,
        onClick: () => setOpen(!open),
      }}
      messagesProps={{
        messages: renderedMessages,
      }}
      headerProps={{
        onClose: () => setOpen(false),
      }}
      promptProps={{}}
    />
  );
}
