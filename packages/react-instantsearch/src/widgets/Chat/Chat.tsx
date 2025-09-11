import { DefaultChatTransport } from 'ai';
import { createChatComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useChat, useInstantSearch } from 'react-instantsearch-core';

import { Carousel } from '../../components';

import type {
  ChatMessageBase,
  ChatMessagesProps,
  Pragma,
  Tools,
} from 'instantsearch-ui-components';

const ChatUiComponent = createChatComponent({
  createElement: createElement as unknown as Pragma,
  Fragment,
});

const AssistantLeadingComponent = () => (
  <div
    style={{
      width: '24px',
      height: '24px',
      borderRadius: '9999px',
      backgroundColor:
        'rgba(var(--ais-primary-color-rgb), var(--ais-primary-color-alpha))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color:
        'rgba(var(--ais-button-text-color-rgb), var(--ais-button-text-color-alpha))',
      fontSize: '12px',
      fontWeight: 'bold',
    }}
  >
    A
  </div>
);

const UserLeadingComponent = () => (
  <div
    style={{
      width: '24px',
      height: '24px',
      borderRadius: '9999px',
      backgroundColor: 'rgba(var(--ais-muted-color-rgb), 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color:
        'rgba(var(--ais-button-text-color-rgb), var(--ais-button-text-color-alpha))',
      fontSize: '12px',
      fontWeight: 'bold',
    }}
  >
    U
  </div>
);

const copyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const regenerateIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const copyToClipboard = (message: ChatMessageBase) => {
  navigator.clipboard.writeText(
    message.parts
      .map((part) => {
        if ('text' in part) {
          return part.text;
        }
        return '';
      })
      .join('')
  );
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

export type ChatProps = {
  itemComponent?: (props: { item: Record<string, unknown> }) => JSX.Element;
  tools?: Tools;
  messagesProps?: Partial<ChatMessagesProps>;
} & (
  | { agentId: string; transport?: never }
  | {
      transport: NonNullable<
        ConstructorParameters<typeof DefaultChatTransport>[0]
      >;
      agentId?: never;
    }
);

export function Chat({
  tools: userTools,
  agentId,
  transport: userTransport,
  itemComponent,
  messagesProps,
}: ChatProps) {
  const { indexUiState, setIndexUiState } = useInstantSearch();

  const [open, setOpen] = React.useState(false);
  const [maximized, setMaximized] = React.useState(false);
  const [input, setInput] = React.useState('');

  const tools = React.useMemo(() => {
    return [...createDefaultTools(itemComponent), ...(userTools ?? [])];
  }, [userTools, itemComponent]);

  const transport = React.useMemo(() => {
    if (!userTransport && !agentId) {
      throw new Error(
        'You need to provide either an `agentId` or a `transport`.'
      );
    }
    if (userTransport && agentId) {
      throw new Error(
        'You cannot provide both an `agentId` and a `transport`.'
      );
    }
    if (!userTransport && agentId) {
      return new DefaultChatTransport({
        api: `https://agent-studio-staging.eu.algolia.com/1/agents/${agentId}/completions?stream=true&compatibilityMode=ai-sdk-5`,
        headers: {
          'x-algolia-application-id': 'F4T6CUV2AH',
          'X-Algolia-API-Key': '93aba0bf5908533b213d93b2410ded0c',
        },
      });
    }

    return new DefaultChatTransport(userTransport);
  }, [userTransport, agentId]);

  const { messages, sendMessage, regenerate, status, stop } = useChat({
    transport,
    onToolCall: (params) => {
      tools?.forEach((tool) => {
        if (tool.type === params.toolCall.toolName) {
          tool.onToolCall?.(params.toolCall);
        }
      });
    },
  });

  const assistantActions = React.useMemo(
    () => [
      {
        title: 'Copy to clipboard',
        icon: copyIcon,
        onClick: copyToClipboard,
      },
      {
        title: 'Regenerate',
        icon: regenerateIcon,
        onClick: (message) => {
          regenerate({ messageId: message?.id });
        },
      },
      {
        title: 'More actions',
        disabled: true,
      },
    ],
    [regenerate]
  );

  const userActions = React.useMemo(
    () => [
      {
        title: 'Copy to clipboard',
        icon: copyIcon,
        onClick: copyToClipboard,
      },
    ],
    []
  );

  return (
    <ChatUiComponent
      open={open}
      maximized={maximized}
      toggleButtonProps={{
        open,
        onClick: () => setOpen(!open),
      }}
      messagesProps={{
        ...messagesProps,
        status,
        onReload: () => regenerate(),
        messages,
        tools,
        indexUiState,
        setIndexUiState,
        assistantMessageProps: {
          actions: assistantActions,
          leadingComponent: AssistantLeadingComponent,
        },
        userMessageProps: {
          actions: userActions,
          leadingComponent: UserLeadingComponent,
        },
      }}
      headerProps={{
        onClose: () => setOpen(false),
        onToggleMaximize: () => setMaximized(!maximized),
        maximized,
      }}
      promptProps={{
        status,
        value: input,
        onChange: (event) => {
          setInput(event.target.value);
        },
        onSubmit: () => {
          sendMessage({ text: input });
          setInput('');
        },
        onStop: () => {
          stop();
        },
      }}
    />
  );
}
