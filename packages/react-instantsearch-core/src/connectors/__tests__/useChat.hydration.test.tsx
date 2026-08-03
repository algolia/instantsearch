/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { act, waitFor } from '@testing-library/react';
import { CACHE_KEY, Chat } from 'instantsearch.js/es/lib/chat/chat';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { InstantSearch } from '../../components/InstantSearch';
import { InstantSearchSSRProvider } from '../../components/InstantSearchSSRProvider';
import { getServerState } from '../../server/getServerState';
import { useChat } from '../useChat';

import type { InstantSearchServerState } from '../../components/InstantSearchSSRProvider';

const agentId = 'hydration-agent';

function createMessage(id: string, text: string) {
  return { id, role: 'assistant', parts: [{ type: 'text', text }] };
}

// Parses server markup into a container `hydrateRoot` can adopt. `innerHTML`
// would do the same, but static analysis cannot tell `renderToString` output
// from untrusted input and flags it.
function createHydrationContainer(html: string) {
  const container = document.createElement('div');
  container.append(document.createRange().createContextualFragment(html));
  document.body.append(container);

  return container;
}

function createApp(props: Record<string, unknown>) {
  function ChatProbe() {
    const { messages, status, suggestions, id, error } = useChat<any>({
      agentId,
      disableTriggerValidation: true,
      requiresSearch: false,
      ...props,
    } as any);

    return (
      <span
        data-testid="probe"
        data-status={status}
        data-chat-id={id}
        data-error={error ? error.message : ''}
      >
        {`${messages.map((message: any) => message.parts[0].text).join('|')}/${(
          suggestions || []
        ).join('|')}`}
      </span>
    );
  }

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
          <ChatProbe />
        </InstantSearch>
      </InstantSearchSSRProvider>
    );
  };
}

async function renderServerMarkup(App: ReturnType<typeof createApp>) {
  const serverState = await getServerState(<App />, { renderToString });

  return {
    serverState,
    html: renderToString(<App serverState={serverState} />),
  };
}

describe('useChat server rendering', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders no messages passed as a connector option', async () => {
    const App = createApp({
      messages: [createMessage('explicit', 'EXPLICIT')],
    });

    const { html } = await renderServerMarkup(App);

    expect(html).not.toContain('EXPLICIT');
  });

  it('renders no initial messages', async () => {
    const App = createApp({
      initialMessages: [createMessage('initial', 'INITIAL')],
    });

    const { html } = await renderServerMarkup(App);

    expect(html).not.toContain('INITIAL');
  });

  it('renders no messages restored from browser storage', async () => {
    sessionStorage.setItem(
      `${CACHE_KEY}-${agentId}`,
      JSON.stringify([createMessage('restored', 'RESTORED')])
    );
    const App = createApp({});

    const { html } = await renderServerMarkup(App);

    // Storage exists here and the connector's Chat does restore the message, so
    // what keeps it out of the markup is the inert shell, not missing storage.
    expect(html).not.toContain('RESTORED');
  });

  it('renders no suggestions carried by a stored message', async () => {
    sessionStorage.setItem(
      `${CACHE_KEY}-${agentId}`,
      JSON.stringify([
        {
          id: 'restored',
          role: 'assistant',
          parts: [
            { type: 'text', text: 'RESTORED' },
            { type: 'data-suggestions', data: { suggestions: ['SUGGESTED'] } },
          ],
        },
      ])
    );
    const App = createApp({});

    const { html } = await renderServerMarkup(App);

    expect(html).not.toContain('SUGGESTED');
  });

  it('renders a ready status while a chat is mid-stream', async () => {
    // A custom `chat` can already be streaming when a consumer mounts, which a
    // server render never reproduces: its own chat has no transport activity.
    const chat = new Chat<any>({
      persistence: false,
      transport: { reconnectToStream: () => new Promise(() => {}) } as any,
    });
    chat.resumeStream();
    const App = createApp({ chat, transport: {} });

    const { html } = await renderServerMarkup(App);

    expect(chat.status).toBe('submitted');
    expect(html).toContain('data-status="ready"');
  });

  it('renders no error a caller-owned chat is already holding', async () => {
    // A custom `chat` can already have failed when a consumer mounts, which a
    // server render never reproduces: its own chat runs no request. The widget's
    // own error UI is gated on the already-pinned `status`, so what an unpinned
    // error diverges is the render state `useChat` hands to its callers.
    const chat = new Chat<any>({
      persistence: false,
      transport: {
        sendMessages: () => Promise.reject(new Error('TRANSPORT_BOOM')),
      } as any,
    });
    await chat.sendMessage({ text: 'Hello' });
    const App = createApp({ chat, transport: {} });

    const { html } = await renderServerMarkup(App);

    expect(chat.error?.message).toBe('TRANSPORT_BOOM');
    expect(html).toContain('data-error=""');
  });

  it('renders no default chat id', async () => {
    // The default is a random string per Chat, and the server and the browser
    // each build their own, so an unpinned default cannot survive hydration.
    const App = createApp({});

    const { html } = await renderServerMarkup(App);

    expect(html).toContain('data-chat-id=""');
  });

  it('renders a chat id the caller supplied', async () => {
    // A supplied `id` is the same on both sides, so withholding it would ship an
    // empty value the consumer has to correct after hydration.
    const App = createApp({ id: 'conversation-1' });

    const { html } = await renderServerMarkup(App);

    expect(html).toContain('data-chat-id="conversation-1"');
  });

  it('hydrates the shell without a recoverable error, then applies live state', async () => {
    const App = createApp({});

    // The markup is produced with empty storage, the way a server that cannot
    // read it does. The browser then has a message the server never saw.
    const { serverState, html } = await renderServerMarkup(App);
    sessionStorage.setItem(
      `${CACHE_KEY}-${agentId}`,
      JSON.stringify([createMessage('restored', 'RESTORED')])
    );

    const container = createHydrationContainer(html);
    const recoverableErrors: string[] = [];
    let root!: ReturnType<typeof hydrateRoot>;

    await act(async () => {
      root = hydrateRoot(container, <App serverState={serverState} />, {
        onRecoverableError: (error) => {
          recoverableErrors.push(String(error));
        },
      });
    });

    expect(recoverableErrors).toEqual([]);

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="probe"]')
      ).toHaveTextContent('RESTORED');
    });

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
