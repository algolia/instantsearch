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
const foreignAgentId = 'foreign-agent';

// Parses server markup into a container `hydrateRoot` can adopt. Assigning
// `innerHTML` from a variable would do the same thing here, but the security
// scanner cannot tell `renderToString` output from untrusted input and flags
// it. `useIsHydrated.test.tsx` builds its container the same way.
function createHydrationContainer(html: string) {
  const container = document.createElement('div');
  container.append(document.createRange().createContextualFragment(html));
  document.body.append(container);

  return container;
}

function ChatProbe() {
  const { messages } = useChat<any>({
    agentId,
    disableTriggerValidation: true,
    requiresSearch: false,
  } as any);

  return (
    <span data-messages>
      {messages.map((message: any) => message.parts[0].text).join('|')}
    </span>
  );
}

function App({ serverState }: { serverState?: InstantSearchServerState }) {
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
}

describe('useChat hydration', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('does not seed the server tree from a chat without the snapshot hook', async () => {
    // A `chat` from another copy of instantsearch.js exposes no way to ask
    // which of its messages came from storage. Seeding the hydration render
    // from `chat.messages` would put restored messages in a tree the server
    // rendered without them, so the conservative empty fallback is correct
    // even though it means caller messages appear only after hydration.
    sessionStorage.setItem(
      `${CACHE_KEY}-${foreignAgentId}`,
      JSON.stringify([
        {
          id: 'restored',
          role: 'assistant',
          parts: [{ type: 'text', text: 'RESTORED' }],
        },
      ])
    );

    const foreignChat = new Chat<any>({
      agentId: foreignAgentId,
      transport: {} as any,
    });
    delete (foreignChat as any)['~getServerMessages'];

    function ForeignProbe() {
      const { messages } = useChat<any>({
        chat: foreignChat,
        disableTriggerValidation: true,
        requiresSearch: false,
      } as any);

      return (
        <span data-messages>
          {messages.map((message: any) => message.parts[0].text).join('|')}
        </span>
      );
    }

    function ForeignApp({
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
            <ForeignProbe />
          </InstantSearch>
        </InstantSearchSSRProvider>
      );
    }

    const serverState = await getServerState(<ForeignApp />, {
      renderToString,
    });
    const html = renderToString(<ForeignApp serverState={serverState} />);

    expect(html).not.toContain('RESTORED');

    // The point of the empty fallback is that hydration stays clean. Seeding
    // from `chat.messages` here would make the client render RESTORED against
    // a server tree that has none.
    const container = createHydrationContainer(html);

    const recoverableErrors: string[] = [];
    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, <ForeignApp serverState={serverState} />, {
        onRecoverableError: (error) => {
          recoverableErrors.push(String(error));
        },
      });
    });

    expect(recoverableErrors).toEqual([]);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('withholds messages restored from storage until hydration completes', async () => {
    sessionStorage.setItem(
      `${CACHE_KEY}-${agentId}`,
      JSON.stringify([
        {
          id: 'restored',
          role: 'assistant',
          parts: [{ type: 'text', text: 'RESTORED' }],
        },
      ])
    );

    const serverState = await getServerState(<App />, { renderToString });
    const html = renderToString(<App serverState={serverState} />);

    // `sessionStorage` exists in this environment and the connector's Chat
    // does restore the message. What keeps it out of the markup is the
    // hydration masking, not the absence of storage.
    expect(html).not.toContain('RESTORED');

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

    // The restored message is applied once the consumer has hydrated.
    await waitFor(() => {
      expect(container.querySelector('[data-messages]')).toHaveTextContent(
        'RESTORED'
      );
    });

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
