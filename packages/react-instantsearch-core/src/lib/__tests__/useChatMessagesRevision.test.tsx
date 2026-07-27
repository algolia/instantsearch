/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { act } from '@testing-library/react';
import { Chat } from 'instantsearch.js/es/lib/chat/chat';
import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { InstantSearch } from '../../components/InstantSearch';
import { InstantSearchSSRProvider } from '../../components/InstantSearchSSRProvider';
import { useChat } from '../../connectors/useChat';
import { getServerState } from '../../server/getServerState';

import type { InstantSearchServerState } from '../../components/InstantSearchSSRProvider';

const SNAPSHOT_STORE = Symbol.for('InstantSearchChatMessagesSnapshotState');

// Every message update walks this set, so what belongs in it is a cost every
// Chat consumer pays, not only the roots that put entries there.
//
// Membership is compared by identity rather than by size. The store is global
// and weak registrations from earlier renders are pruned lazily, whenever
// something next walks the set, so a size taken before and after would move for
// reasons that have nothing to do with the root under test.
function activeRegistrations(): Set<unknown> {
  const store = (
    globalThis as unknown as Record<
      symbol,
      { active: Set<unknown> } | undefined
    >
  )[SNAPSHOT_STORE];

  return new Set(store ? store.active : []);
}

function addedSince(before: Set<unknown>): unknown[] {
  return [...activeRegistrations()].filter(
    (registration) => !before.has(registration)
  );
}

function message(id: string, text: string) {
  return { id, role: 'assistant', parts: [{ type: 'text', text }] };
}

function createChat() {
  return new Chat<any>({
    agentId: 'registration-agent',
    transport: {} as any,
    messages: [message('server', 'SERVER')],
    persistence: false,
  });
}

function ChatProbe({ chat }: { chat: any }) {
  const { messages } = useChat<any>({
    chat,
    disableTriggerValidation: true,
    requiresSearch: false,
  } as any);

  return (
    <span data-messages>
      {messages.map((entry: any) => entry.parts[0].text).join('|')}
    </span>
  );
}

function App({
  serverState,
  chat,
}: {
  serverState?: InstantSearchServerState;
  chat: any;
}) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch
        searchClient={createSearchClient({})}
        indexName="indexName"
      >
        <ChatProbe chat={chat} />
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

describe('chat message revision registrations', () => {
  it('registers nothing for a root that mounts straight into the browser', async () => {
    const chat = createChat();
    const before = activeRegistrations();
    const container = document.createElement('div');
    document.body.append(container);

    const root = createRoot(container);
    await act(async () => {
      root.render(<App chat={chat} />);
    });

    // Nothing will ever ask a client-only root for a server baseline, so it
    // must not stay in the set that every message update walks.
    expect(addedSince(before)).toEqual([]);

    // An update while mounted must not pin a baseline either.
    await act(async () => {
      chat.messages = [message('client', 'CLIENT')];
    });
    expect(addedSince(before)).toEqual([]);
    expect(container.textContent).toBe('CLIENT');

    await act(async () => {
      root.unmount();
    });
    container.remove();
    expect(addedSince(before)).toEqual([]);
  });

  it('registers a hydrating root and clears it on unmount', async () => {
    const chat = createChat();
    const serverState = await getServerState(<App chat={chat} />, {
      renderToString,
    });
    const html = renderToString(<App serverState={serverState} chat={chat} />);
    expect(html).toContain('SERVER');

    const container = document.createElement('div');
    container.append(document.createRange().createContextualFragment(html));
    document.body.append(container);

    const before = activeRegistrations();
    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(
        container,
        <App serverState={serverState} chat={chat} />
      );
    });

    // The contrast with the client-only case: a hydrating root does need to
    // record baselines, so it is registered while it is mounted.
    expect(addedSince(before)).toHaveLength(1);

    await act(async () => {
      root.unmount();
    });
    container.remove();

    expect(addedSince(before)).toEqual([]);
  });

  it('registers the server pass without holding it open', async () => {
    const chat = createChat();
    const serverState = await getServerState(<App chat={chat} />, {
      renderToString,
    });
    const before = activeRegistrations();

    const html = renderToString(<App serverState={serverState} chat={chat} />);
    expect(html).toContain('SERVER');

    // The server has no effect phase to release a strong registration in, so
    // the pass registers weakly and exactly once. Without this the render-phase
    // registration could be dropped entirely and nothing would notice.
    const added = addedSince(before);
    expect(added).toHaveLength(1);

    // A message update during the pass records its pre-update baseline into
    // that registration, which is the whole reason it exists.
    const revision = (added[0] as { deref: () => unknown }).deref();
    chat.messages = [message('later', 'LATER')];
    expect(
      (chat as any)
        ['~getServerMessages'](revision)
        .map((entry: any) => entry.parts[0].text)
    ).toEqual(['SERVER']);
  });
});
