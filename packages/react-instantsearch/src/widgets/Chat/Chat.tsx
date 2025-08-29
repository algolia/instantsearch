import { DefaultChatTransport } from 'ai';
import { createChatComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useChat } from 'react-instantsearch-core';

import { Carousel } from '../../components';

import type { CarouselProps } from '../../components';
import type { Pragma } from 'instantsearch-ui-components';

const ChatUiComponent = createChatComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export type ChatProps = {
  agentId: string;
  itemComponent?: (props: { item: Record<string, unknown> }) => JSX.Element;
};

export function Chat({ agentId, itemComponent }: ChatProps) {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      // api: `https://generative-eu.algolia.com/1/agents/${agentId}/completions?stream=true&compatibilityMode=ai-sdk-5`,
      api: `https://agent-studio-staging.eu.algolia.com/1/agents/${agentId}/completions?stream=true&compatibilityMode=ai-sdk-5`,
      headers: {
        'x-algolia-application-id': 'F4T6CUV2AH',
        'X-Algolia-API-Key': '93aba0bf5908533b213d93b2410ded0c',
      },
    }),
  });

  const DefaultCarousel = <TObject extends Record<string, unknown>>(
    props: Pick<CarouselProps<TObject>, 'items'>
  ) => {
    return (
      <Carousel {...props} itemComponent={itemComponent} sendEvent={() => {}} />
    );
  };

  return (
    <ChatUiComponent
      open={open}
      toggleButtonProps={{
        open,
        onClick: () => setOpen(!open),
      }}
      messagesProps={{
        messages,
        carouselComponent: DefaultCarousel,
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
