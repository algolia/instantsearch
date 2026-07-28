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

const searchClient = createSearchClient();

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
  reasoningLabel = 'Reasoning',
}: {
  chat: ChatInstance<UIMessage>;
  showReasoning: boolean;
  reasoningLabel?: string;
}) {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="indexName"
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <Chat
        chat={chat}
        transport={{ api: 'http://unused' }}
        layoutComponent={ChatInlineLayout}
        requiresSearch={false}
        showReasoning={showReasoning}
        translations={{ message: { reasoningLabel } }}
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

  test('updates the reasoning label on completed messages', async () => {
    const chat = createChat();
    const { rerender } = render(
      <ChatUnderTest
        chat={chat}
        showReasoning={true}
        reasoningLabel="Reasoning"
      />
    );
    await act(async () => {
      await wait(0);
    });
    expect(screen.getAllByRole('group', { name: 'Reasoning' })).toHaveLength(2);

    rerender(
      <ChatUnderTest
        chat={chat}
        showReasoning={true}
        reasoningLabel="Raisonnement"
      />
    );
    await act(async () => {
      await wait(0);
    });

    expect(screen.queryAllByRole('group', { name: 'Reasoning' })).toHaveLength(
      0
    );
    expect(screen.getAllByRole('group', { name: 'Raisonnement' })).toHaveLength(
      2
    );
  });

  test('merges messagesProps.assistantMessageProps with the dedicated props', async () => {
    const chat = createChat();
    const { container } = render(
      <InstantSearch
        searchClient={searchClient}
        indexName="indexName"
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <Chat
          chat={chat}
          transport={{ api: 'http://unused' }}
          layoutComponent={ChatInlineLayout}
          requiresSearch={false}
          showReasoning={true}
          assistantMessageLeadingComponent={() => (
            <span data-testid="assistant-leading" />
          )}
          messagesProps={{
            onClose: () => {},
            onReload: () => {},
            assistantMessageProps: { autoHideActions: true },
          }}
        />
      </InstantSearch>
    );
    await act(async () => {
      await wait(0);
    });

    // The nested object sets one key; the dedicated props must survive alongside it.
    expect(screen.getAllByTestId('assistant-leading')).toHaveLength(2);
    expect(screen.getAllByRole('group', { name: 'Reasoning' })).toHaveLength(2);
    // And the caller's own key has to reach the message, or the merge is only
    // tested in one direction.
    expect(
      container.querySelectorAll('.ais-ChatMessage--auto-hide-actions')
    ).toHaveLength(2);
  });

  test('routes parseMarkdown from messagesProps into reasoning', async () => {
    const chat = new ChatInstance<UIMessage>({
      persistence: false,
      messages: [
        {
          id: 'assistant-1',
          role: 'assistant',
          parts: [
            {
              type: 'reasoning',
              text: 'Check the **catalog**.',
              state: 'done',
            },
          ],
        },
      ],
    });
    const { container } = render(
      <InstantSearch
        searchClient={searchClient}
        indexName="indexName"
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <Chat
          chat={chat}
          transport={{ api: 'http://unused' }}
          layoutComponent={ChatInlineLayout}
          requiresSearch={false}
          showReasoning={true}
          messagesProps={{
            onClose: () => {},
            onReload: () => {},
            assistantMessageProps: { parseMarkdown: false },
          }}
        />
      </InstantSearch>
    );
    await act(async () => {
      await wait(0);
    });

    expect(container.querySelector('strong')).toBeNull();
    expect(
      screen.getByRole('group', { name: 'Reasoning' }).textContent
    ).toContain('Check the **catalog**.');
  });

  test('updates reasoning on completed messages when parseMarkdown changes', async () => {
    const chat = new ChatInstance<UIMessage>({
      persistence: false,
      messages: [
        {
          id: 'assistant-1',
          role: 'assistant',
          parts: [
            {
              type: 'reasoning',
              text: 'Check the **catalog**.',
              state: 'done',
            },
            { type: 'text', text: 'I found one option.' },
          ],
        },
        {
          id: 'assistant-2',
          role: 'assistant',
          parts: [
            {
              type: 'reasoning',
              text: 'Compare the **results**.',
              state: 'done',
            },
            { type: 'text', text: 'Here is another option.' },
          ],
        },
      ],
    });

    function Subject({ parseMarkdown }: { parseMarkdown: boolean }) {
      return (
        <InstantSearch
          searchClient={searchClient}
          indexName="indexName"
          future={{ preserveSharedStateOnUnmount: true }}
        >
          <Chat
            chat={chat}
            transport={{ api: 'http://unused' }}
            layoutComponent={ChatInlineLayout}
            requiresSearch={false}
            showReasoning={true}
            messagesProps={{
              onClose: () => {},
              onReload: () => {},
              assistantMessageProps: { parseMarkdown },
            }}
          />
        </InstantSearch>
      );
    }

    const { container, rerender } = render(<Subject parseMarkdown={true} />);
    await act(async () => {
      await wait(0);
    });
    expect(container.querySelectorAll('strong')).toHaveLength(2);

    rerender(<Subject parseMarkdown={false} />);
    await act(async () => {
      await wait(0);
    });

    // Earlier rows are memoized, so the prop has to take part in the comparator.
    expect(container.querySelectorAll('strong')).toHaveLength(0);
  });
});
