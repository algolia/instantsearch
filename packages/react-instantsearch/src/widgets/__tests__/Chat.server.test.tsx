/**
 * @jest-environment @instantsearch/testutils/jest-environment-node.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { Chat as ChatInstance } from 'instantsearch.js/es/lib/chat/chat';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  InstantSearch,
  InstantSearchSSRProvider,
  getServerState,
} from 'react-instantsearch-core';

import { Chat } from '../Chat';

import type { InstantSearchServerState } from 'react-instantsearch-core';

function createApp(props: Record<string, unknown>) {
  return function App({
    serverState,
  }: {
    serverState?: InstantSearchServerState;
  }) {
    return (
      <InstantSearchSSRProvider {...serverState}>
        <InstantSearch
          searchClient={createSearchClient({})}
          indexName="indexName"
        >
          <Chat
            agentId="server-agent"
            disableTriggerValidation
            requiresSearch={false}
            {...props}
          />
        </InstantSearch>
      </InstantSearchSSRProvider>
    );
  };
}

async function renderServerMarkup(App: ReturnType<typeof createApp>) {
  const serverState = await getServerState(<App />, { renderToString });

  return renderToString(<App serverState={serverState} />);
}

describe('Chat server rendering', () => {
  it('renders an inert, closed shell without a window', async () => {
    expect(typeof window).toBe('undefined');

    const html = await renderServerMarkup(createApp({}));

    expect(html).toContain('ais-Chat-container');
    expect(html).not.toContain('ais-Chat-container--open');
  });

  it('renders no messages passed as a prop', async () => {
    const html = await renderServerMarkup(
      createApp({
        messages: [
          {
            id: 'explicit',
            role: 'assistant',
            parts: [{ type: 'text', text: 'EXPLICIT' }],
          },
        ],
      })
    );

    expect(html).not.toContain('EXPLICIT');
    expect(html).toContain('<div class="ais-ChatMessages-content"></div>');
  });

  it('renders no initial messages', async () => {
    // `messages` has to stay absent: the connector applies `initialMessages`
    // only to a chat that has none, so passing both would make this vacuous.
    const html = await renderServerMarkup(
      createApp({
        initialMessages: [
          {
            id: 'initial',
            role: 'assistant',
            parts: [{ type: 'text', text: 'INITIAL' }],
          },
        ],
      })
    );

    expect(html).not.toContain('INITIAL');
    expect(html).toContain('<div class="ais-ChatMessages-content"></div>');
  });

  it('renders a caller-owned chat that already failed', async () => {
    // `Chat` rethrows a held error during render under `__DEV__`, so an error
    // carried over from the caller's own instance aborts the server render
    // instead of showing up in its markup. The error text itself is never
    // rendered either way, because the shell shows a generic message for
    // anything but a guardrail violation.
    const chat = new ChatInstance<any>({
      persistence: false,
      transport: {
        sendMessages: () => Promise.reject(new Error('TRANSPORT_BOOM')),
      } as any,
    });
    await chat.sendMessage({ text: 'Hello' });

    expect(chat.error?.message).toBe('TRANSPORT_BOOM');

    const html = await renderServerMarkup(
      createApp({ chat, transport: {}, agentId: undefined })
    );

    expect(html).toContain('<div class="ais-ChatMessages-content"></div>');
  });
});
