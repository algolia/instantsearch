/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { act } from '@testing-library/react';
import { Chat } from 'instantsearch.js/es/lib/chat/chat';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { InstantSearch } from '../../components/InstantSearch';
import { InstantSearchSSRProvider } from '../../components/InstantSearchSSRProvider';
import { getServerState } from '../../server/getServerState';
import { useChat } from '../useChat';

import type { InstantSearchServerState } from '../../components/InstantSearchSSRProvider';

// Parses server markup into a container `hydrateRoot` can adopt, the way
// `useChat.hydration.test.tsx` does.
function createHydrationContainer(html: string) {
  const container = document.createElement('div');
  container.append(document.createRange().createContextualFragment(html));
  document.body.append(container);

  return container;
}

// A boundary that suspends on its first client render and resolves on demand,
// standing in for a code-split chunk that arrives after hydration started. The
// server tree renders without it, so `renderToString` never suspends and the
// markup is identical either way.
function createGate() {
  let opened = false;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = () => {
      opened = true;
      resolve();
    };
  });

  function Gate({ children }: { children: React.ReactNode }) {
    if (!opened) {
      throw pending;
    }

    return <React.Fragment>{children}</React.Fragment>;
  }

  return { Gate, open: () => release(), pending };
}

function message(id: string, text: string) {
  return { id, role: 'assistant', parts: [{ type: 'text', text }] };
}

type GateComponent = (props: {
  children: React.ReactNode;
}) => React.ReactElement;

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

// `boundary: 'root'` delays `<InstantSearch>` itself, `boundary: 'consumer'`
// delays only the Chat consumer below an `<InstantSearch>` that already
// committed, and `boundary: 'nested-provider'` delays a second provider below
// the one that owns the capture.
function App({
  serverState,
  chat,
  Gate,
  boundary,
}: {
  serverState?: InstantSearchServerState;
  chat: any;
  Gate?: GateComponent;
  boundary: 'root' | 'consumer' | 'nested-provider';
}) {
  const wrap = (node: React.ReactElement) =>
    Gate ? <Gate>{node}</Gate> : node;

  if (boundary === 'nested-provider') {
    // The inner provider renders only once the boundary resolves. It must not
    // recapture, or it shadows the outer capture with one taken too late.
    return (
      <InstantSearchSSRProvider {...serverState}>
        <React.Suspense fallback={null}>
          {wrap(
            <InstantSearchSSRProvider>
              <InstantSearch
                searchClient={createSearchClient({})}
                indexName="indexName"
              >
                <ChatProbe chat={chat} />
              </InstantSearch>
            </InstantSearchSSRProvider>
          )}
        </React.Suspense>
      </InstantSearchSSRProvider>
    );
  }

  if (boundary === 'consumer') {
    return (
      <InstantSearchSSRProvider {...serverState}>
        <InstantSearch
          searchClient={createSearchClient({})}
          indexName="indexName"
        >
          <React.Suspense fallback={null}>
            {wrap(<ChatProbe chat={chat} />)}
          </React.Suspense>
        </InstantSearch>
      </InstantSearchSSRProvider>
    );
  }

  return (
    <InstantSearchSSRProvider {...serverState}>
      <React.Suspense fallback={null}>
        {wrap(
          <InstantSearch
            searchClient={createSearchClient({})}
            indexName="indexName"
          >
            <ChatProbe chat={chat} />
          </InstantSearch>
        )}
      </React.Suspense>
    </InstantSearchSSRProvider>
  );
}

function createChat() {
  return new Chat<any>({
    agentId: 'delayed-boundary-agent',
    transport: {} as any,
    messages: [message('server', 'SERVER')],
    persistence: false,
  });
}

async function hydrateBehindGate({
  boundary,
  mutateWhileSuspended,
  tamperServerHtml = false,
  mutateBeforeRender = false,
}: {
  boundary: 'root' | 'consumer' | 'nested-provider';
  mutateWhileSuspended: boolean;
  tamperServerHtml?: boolean;
  mutateBeforeRender?: boolean;
}) {
  const chat = createChat();
  if (mutateBeforeRender) {
    // Moves the snapshot away from `_serverMessages`, which is frozen at
    // construction. Both sides of the render then have to agree through the
    // captured revision rather than through that frozen array.
    chat.messages = [message('server', 'SERVER'), message('extra', 'EXTRA')];
  }
  const serverState = await getServerState(
    <App chat={chat} boundary={boundary} />,
    { renderToString }
  );
  const rendered = renderToString(
    <App serverState={serverState} chat={chat} boundary={boundary} />
  );

  // Without this the rest of the test would pass vacuously.
  expect(rendered).toContain('SERVER');

  const html = tamperServerHtml
    ? rendered.replace('SERVER', 'NEVER-RENDERED')
    : rendered;

  const container = createHydrationContainer(html);
  const { Gate, open, pending } = createGate();

  const recoverableErrors: string[] = [];
  let root!: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(
      container,
      <App
        serverState={serverState}
        chat={chat}
        Gate={Gate}
        boundary={boundary}
      />,
      {
        onRecoverableError: (error) => {
          recoverableErrors.push(String(error));
        },
      }
    );
  });

  if (mutateWhileSuspended) {
    await act(async () => {
      chat.messages = [message('client', 'CLIENT')];
    });
  }

  await act(async () => {
    open();
    await pending;
  });

  const text = container.textContent;

  await act(async () => {
    root.unmount();
  });
  container.remove();

  return { recoverableErrors, text };
}

describe('useChat hydration behind a delayed Suspense boundary', () => {
  it('keeps the server baseline when the boundary above <InstantSearch> resolves after a client mutation', async () => {
    // The root renders for the first time only once the boundary resolves. If
    // it captured its revision then, the capture would already contain the
    // mutation and those messages would be served as the server baseline
    // against markup that never had them.
    const { recoverableErrors, text } = await hydrateBehindGate({
      boundary: 'root',
      mutateWhileSuspended: true,
    });

    expect(recoverableErrors).toEqual([]);
    // The mutation is not lost, it lands once the boundary has hydrated.
    expect(text).toBe('CLIENT');
  });

  it('keeps the outer capture when a nested provider renders behind the boundary', async () => {
    // A second provider below the boundary must inherit rather than recapture.
    // Recapturing would take its revision after the mutation and shadow the
    // correct one the outer provider took at hydration start.
    const { recoverableErrors, text } = await hydrateBehindGate({
      boundary: 'nested-provider',
      mutateWhileSuspended: true,
    });

    expect(recoverableErrors).toEqual([]);
    expect(text).toBe('CLIENT');
  });

  it('does not report a recoverable error when nothing mutates while suspended', async () => {
    // Control for the harness itself: a boundary that delays `<InstantSearch>`
    // is not on its own enough to disturb hydration. If this arm ever fails,
    // the gate is interfering rather than the captured revision.
    const { recoverableErrors, text } = await hydrateBehindGate({
      boundary: 'root',
      mutateWhileSuspended: false,
    });

    expect(recoverableErrors).toEqual([]);
    expect(text).toBe('SERVER');
  });

  it('hydrates cleanly when only the Chat consumer is delayed', async () => {
    // The consumer-local hydration signal carries this shape: the root
    // captured its revision before the mutation, so the boundary hydrates
    // against the server messages and applies the mutation afterwards.
    const { recoverableErrors, text } = await hydrateBehindGate({
      boundary: 'consumer',
      mutateWhileSuspended: true,
    });

    expect(recoverableErrors).toEqual([]);
    expect(text).toBe('CLIENT');
  });

  it('serves the revision that <InstantSearch> captured, not the construction snapshot', async () => {
    // The chat moves on before the server renders, so `_serverMessages` is
    // already stale by the time the client hydrates. The only thing that can
    // still reproduce the server tree is the revision `<InstantSearch>`
    // captured and registered, so this is what covers that wiring.
    const { recoverableErrors, text } = await hydrateBehindGate({
      boundary: 'consumer',
      mutateBeforeRender: true,
      mutateWhileSuspended: true,
    });

    expect(recoverableErrors).toEqual([]);
    expect(text).toBe('CLIENT');
  });

  it('reports a recoverable error when the hydration tree really does diverge', async () => {
    // Detectability control. Both arms above assert an empty
    // `recoverableErrors`, which is only meaningful if this harness can
    // produce a non-empty one. Hydrating markup the server never rendered
    // must be caught.
    const { recoverableErrors } = await hydrateBehindGate({
      boundary: 'root',
      mutateWhileSuspended: false,
      tamperServerHtml: true,
    });

    expect(recoverableErrors.length).toBeGreaterThan(0);
    expect(recoverableErrors.join('\n')).toContain('Hydration failed');
  });
});
