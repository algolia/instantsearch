/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { act, render, screen } from '@testing-library/react';
import { Chat as ChatInstance } from 'instantsearch.js/es/lib/chat';
import React from 'react';
import { InstantSearch } from 'react-instantsearch-core';

import { ChatInlineLayout } from '../../components/ChatInlineLayout';
import { Chat } from '../Chat';

import type { UIMessage } from 'instantsearch.js/es/lib/chat';

function createChat() {
  return new ChatInstance<UIMessage>({
    persistence: false,
    messages: [
      {
        id: 'user-1',
        role: 'user',
        parts: [{ type: 'text', text: 'Find a product' }],
      },
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: [
          {
            type: 'reasoning',
            text: 'Check the catalog.',
            state: 'done',
          },
          { type: 'text', text: 'I found one option.' },
        ],
      },
      {
        id: 'user-2',
        role: 'user',
        parts: [{ type: 'text', text: 'Find another' }],
      },
      {
        id: 'assistant-2',
        role: 'assistant',
        parts: [
          {
            type: 'reasoning',
            text: 'Compare the results.',
            state: 'done',
          },
          { type: 'text', text: 'Here is another option.' },
        ],
      },
    ],
  });
}

function ChatUnderTest({
  chat,
  showReasoning,
}: {
  chat: ChatInstance<UIMessage>;
  showReasoning: boolean;
}) {
  return (
    <InstantSearch
      searchClient={createSearchClient()}
      indexName="indexName"
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <Chat
        chat={chat}
        transport={{ api: 'http://unused' }}
        layoutComponent={ChatInlineLayout}
        requiresSearch={false}
        showReasoning={showReasoning}
      />
    </InstantSearch>
  );
}

describe('Chat', () => {
  test('shows reasoning on completed messages when enabled after rendering', async () => {
    const chat = createChat();
    const { rerender } = render(
      <ChatUnderTest chat={chat} showReasoning={false} />
    );
    await act(async () => {
      await wait(0);
    });
    expect(screen.queryAllByRole('group', { name: 'Reasoning' })).toHaveLength(
      0
    );

    rerender(<ChatUnderTest chat={chat} showReasoning={true} />);
    await act(async () => {
      await wait(0);
    });

    expect(screen.getAllByRole('group', { name: 'Reasoning' })).toHaveLength(2);
  });

  test('hides reasoning on completed messages when disabled after rendering', async () => {
    const chat = createChat();
    const { rerender } = render(
      <ChatUnderTest chat={chat} showReasoning={true} />
    );
    await act(async () => {
      await wait(0);
    });
    expect(screen.getAllByRole('group', { name: 'Reasoning' })).toHaveLength(2);

    rerender(<ChatUnderTest chat={chat} showReasoning={false} />);
    await act(async () => {
      await wait(0);
    });

    expect(screen.queryAllByRole('group', { name: 'Reasoning' })).toHaveLength(
      0
    );
  });
});
