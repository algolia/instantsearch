import React from 'react';
import { useChat, useStickToBottom } from 'react-instantsearch-core/src';

import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatPrompt } from './ChatPrompt';
import { ChatToggleButton } from './ChatToggleButton';

import type { ChatMessageBase } from './ChatMessages';

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
  const { contentRef, scrollRef, scrollToBottom, isAtBottom } =
    useStickToBottom();
  const renderedMessages = renderMarkdown(messages);

  return (
    <>
      {!open ? (
        <ChatToggleButton
          open={false}
          onClick={() => setOpen(true)}
          openLabel="Open chat"
        />
      ) : (
        <div className="ais-Chat">
          <ChatHeader onClose={() => setOpen(false)} />
          <ChatMessages
            messages={renderedMessages}
            status={status}
            onReload={reload}
            contentRef={contentRef}
            scrollRef={scrollRef}
            isScrollAtBottom={isAtBottom}
            scrollToBottom={scrollToBottom}
            userMessageProps={{
              actions: [
                {
                  title: 'edit',
                  icon: () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM14.06 6.19l3.75 3.75"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ),
                  onClick: (message) => {
                    const idx = messages.findIndex((m) => m.id === message?.id);
                    if (idx === -1) return;

                    const history = messages.slice(0, idx);
                    setMessages(history);
                    setInput(message.content);
                    stop();
                  },
                },
              ],
            }}
            assistantMessageProps={{
              actions: [
                {
                  title: 'Regenerate response',
                  icon: () => (
                    <svg width="16" height="16" viewBox="0 0 512 512">
                      <path d="M436.6,75.4C390.1,28.9,326.7,0,256,0C114.5,0,0,114.5,0,256s114.5,256,256,256 c119.2,0,218.8-81.9,247.6-191.8h-67c-26.1,74.5-96.8,127.5-180.6,127.5c-106.1,0-191.8-85.6-191.8-191.8S149.9,64.2,256,64.2 c53.1,0,100.5,22.3,135,56.8L287.7,224.3H512V0L436.6,75.4z" />
                    </svg>
                  ),
                  onClick: (message) => {
                    const idx = messages.findIndex((m) => m.id === message?.id);
                    if (idx === -1) return;

                    const history = messages.slice(0, idx + 1);
                    setMessages(history);
                    reload();
                  },
                },
              ],
            }}
          />

          <ChatPrompt
            value={input}
            onInput={setInput}
            onSubmit={() => handleSubmit()}
            onStop={stop}
            status={status}
          />
        </div>
      )}
    </>
  );
}
