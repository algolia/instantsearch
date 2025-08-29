import { useChat } from '@ai-sdk/react';
import { createChatComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type { Pragma } from 'instantsearch-ui-components';

const ChatUiComponent = createChatComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export type ChatProps =
  | {
      agentID: string;
    }
  | {
      api: string;
      headers: Record<string, string>;
    };

export function Chat(props: ChatProps) {
  const [open, setOpen] = React.useState(false);
  if ('agentID' in props) {
    throw new Error('Not implemented in this demo');
  }

  const { messages, handleSubmit, input, setInput } = useChat({
    ...('agentID' in props
      ? {}
      : {
          api: props.api,
          headers: props.headers,
        }),
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
        messages: messages as any,
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
