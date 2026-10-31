/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { act, render } from '@testing-library/react';
import React, { startTransition, Suspense, useState } from 'react';

import { InstantSearch } from '../../components/InstantSearch';
import { useChat } from '../useChat';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function until(condition: () => boolean) {
  for (let attempt = 0; attempt < 100 && !condition(); attempt++) {
    await wait(10);
  }
  expect(condition()).toBe(true);
}

test('sends the committed context while a transition is suspended', async () => {
  const bodies: string[] = [];
  let chat: ReturnType<typeof useChat> | undefined;
  let setState: (next: {
    version: number;
    suspend: boolean;
  }) => void = () => {};
  const never = new Promise<void>(() => {});

  function Suspender({ suspend }: { suspend: boolean }) {
    if (suspend) {
      throw never;
    }
    return null;
  }

  function Probe({ version }: { version: number }) {
    chat = useChat<any>({
      agentId: 'inline-props-agent',
      disableTriggerValidation: true,
      requiresSearch: false,
      transport: {
        api: 'https://example.invalid/chat',
        fetch: (_url: unknown, init?: { body?: unknown }) => {
          bodies.push(String(init?.body));
          return Promise.reject(new Error('stop'));
        },
      },
      context: () => ({ version: `v${version}` }),
    } as any);

    return null;
  }

  function App() {
    const [state, set] = useState({ version: 1, suspend: false });
    setState = set;

    return (
      <InstantSearch
        searchClient={createSearchClient({})}
        indexName="indexName"
      >
        <Probe version={state.version} />
        <Suspense fallback={null}>
          <Suspender suspend={state.suspend} />
        </Suspense>
      </InstantSearch>
    );
  }

  render(<App />);
  await act(async () => {
    await wait(0);
  });

  await act(async () => {
    startTransition(() => setState({ version: 2, suspend: true }));
    await wait(0);
  });

  await act(async () => {
    await chat!.sendMessage({ text: 'hi' }).catch(() => {});
    await wait(10);
  });

  expect(bodies.some((body) => body.includes('v1'))).toBe(true);
  expect(bodies.some((body) => body.includes('v2'))).toBe(false);
});

describe('after an abandoned transition', () => {
  const tool = (layoutComponent?: () => unknown) => ({
    onToolCall: () => {},
    layoutComponent,
  });

  test.each([
    [
      'swaps a component',
      (version: number) => ({
        a: tool(version === 1 ? () => null : () => 'swapped'),
      }),
    ],
    [
      'drops a tool',
      (version: number) =>
        version === 1
          ? { a: tool(() => null), b: tool() }
          : { a: tool(() => null) },
    ],
  ])('keeps the chat when the transition %s', async (_name, makeTools) => {
    let chat: ReturnType<typeof useChat> | undefined;
    let setState: (update: (state: any) => any) => void = () => {};
    const never = new Promise<void>(() => {});

    let suspendedRenders = 0;
    let renderedTick = 0;

    function Suspender({ suspend }: { suspend: boolean }) {
      if (suspend) {
        suspendedRenders++;
        throw never;
      }
      return null;
    }

    function Probe({ version, tick }: { version: number; tick: number }) {
      renderedTick = tick;
      chat = useChat<any>({
        agentId: 'inline-props-agent',
        disableTriggerValidation: true,
        requiresSearch: false,
        persistence: false,
        tools: makeTools(version),
      } as any);

      return null;
    }

    function App() {
      const [state, set] = useState({ version: 1, suspend: false, tick: 0 });
      setState = set;

      return (
        <InstantSearch
          searchClient={createSearchClient({})}
          indexName="indexName"
        >
          <Probe version={state.version} tick={state.tick} />
          <Suspense fallback={null}>
            <Suspender suspend={state.suspend} />
          </Suspense>
        </InstantSearch>
      );
    }

    render(<App />);
    await act(async () => {
      await wait(0);
    });
    await act(async () => {
      chat!.setOpen(true);
      chat!.setMessages([
        { id: 'm1', role: 'user', parts: [{ type: 'text', text: 'hi' }] },
      ]);
      await wait(0);
    });

    // `act` never settles on a suspended retry, so use the real scheduler.
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = false;
    try {
      startTransition(() =>
        setState((state) => ({ ...state, version: 2, suspend: true }))
      );
      await until(() => suspendedRenders > 0);
      setState((state) => ({ ...state, tick: state.tick + 1 }));
      await until(() => renderedTick === 1);

      expect(chat!.open).toBe(true);
      expect(chat!.messages).toHaveLength(1);
    } finally {
      (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    }
  });
});
