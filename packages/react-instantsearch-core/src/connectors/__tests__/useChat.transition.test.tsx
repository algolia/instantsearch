/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { act, render } from '@testing-library/react';
import React, { startTransition, Suspense, useState } from 'react';

import { InstantSearch } from '../../components/InstantSearch';
import { useChat } from '../useChat';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
