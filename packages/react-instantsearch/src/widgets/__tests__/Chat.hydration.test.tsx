/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { act, waitFor } from '@testing-library/react';
import { CACHE_KEY } from 'instantsearch.js/es/lib/chat/chat';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import {
  InstantSearch,
  InstantSearchSSRProvider,
  getServerState,
} from 'react-instantsearch-core';

import { Chat } from '../Chat';

import type { InstantSearchServerState } from 'react-instantsearch-core';

const agentId = 'hydration-agent';

// Parses server markup into a container `hydrateRoot` can adopt. `innerHTML`
// would do the same, but static analysis cannot tell `renderToString` output
// from untrusted input and flags it.
function createHydrationContainer(html: string) {
  const container = document.createElement('div');
  container.append(document.createRange().createContextualFragment(html));
  document.body.append(container);

  return container;
}

function App({ serverState }: { serverState?: InstantSearchServerState }) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch
        searchClient={createSearchClient({})}
        indexName="indexName"
      >
        {/* `requiresSearch` is left at its default, so this hydrates the
            search-dependent widget against real initial results. */}
        <Chat agentId={agentId} disableTriggerValidation />
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

describe('Chat hydration', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('hydrates the closed shell without a recoverable error', async () => {
    // Storage is populated before the render, so the connector's Chat restores
    // the message and the inert shell is what keeps it out of the markup. A real
    // server has no storage at all, which `Chat.server.test.tsx` covers.
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
    expect(container.querySelector('.ais-Chat-container--open')).toBeNull();

    await waitFor(() => {
      expect(
        container.querySelector('.ais-ChatMessages-content')
      ).toHaveTextContent('RESTORED');
    });

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
