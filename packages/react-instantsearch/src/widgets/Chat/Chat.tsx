import { createChatComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useChat } from 'react-instantsearch-core';

import type { Pragma } from 'instantsearch-ui-components';
import type { UseChatProps } from 'react-instantsearch-core';

const ChatUiComponent = createChatComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function Chat({ ...props }: UseChatProps) {
  const [open, setOpen] = React.useState(false);
  const {
    messages,
    // setMessages,
    input,
    setInput,
    sendMessage,
    // status,
    // stop,
    // reload,
  } = useChat(props, { $$widgetType: 'ais.chat' });

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
