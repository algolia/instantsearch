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

const chatStream = (chunks: unknown[]) =>
  new Response(
    `${chunks
      .map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`)
      .join('')}data: [DONE]`,
    { headers: { 'Content-Type': 'text/event-stream' } }
  );

test.each([
  ['without a pending transition (control)', false],
  ['while a transition is suspended', true],
])(
  'a streamed tool call uses the committed matcher %s',
  async (_name, suspendFirst) => {
    let chat: ReturnType<typeof useChat> | undefined;
    let setState: (update: (state: any) => any) => void = () => {};
    const never = new Promise<void>(() => {});
    let suspendedRenders = 0;
    const calls: string[] = [];

    function Suspender({ suspend }: { suspend: boolean }) {
      if (suspend) {
        suspendedRenders++;
        throw never;
      }
      return null;
    }

    function Probe({ target }: { target: string }) {
      chat = useChat<any>({
        agentId: 'inline-props-agent',
        disableTriggerValidation: true,
        requiresSearch: false,
        persistence: false,
        sendAutomaticallyWhen: () => false,
        transport: {
          api: 'https://example.invalid/chat',
          fetch: () =>
            Promise.resolve(
              chatStream([
                { type: 'start', messageId: 'assistant-1' },
                {
                  type: 'tool-input-available',
                  toolName: 'foo_a',
                  toolCallId: 'call-1',
                  input: {},
                },
                { type: 'finish' },
              ])
            ),
        },
        tools: {
          foo: {
            matchesToolName: (name: string) => name === target,
            onToolCall: ({ addToolResult, toolCallId }: any) => {
              calls.push(target);
              addToolResult({ output: 'ok', toolCallId });
            },
          },
        },
      } as any);

      return null;
    }

    function App() {
      const [state, set] = useState({ target: 'foo_a', suspend: false });
      setState = set;

      return (
        <InstantSearch
          searchClient={createSearchClient({})}
          indexName="indexName"
        >
          <Probe target={state.target} />
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

    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = false;
    try {
      if (suspendFirst) {
        // The visible chat still handles `foo_a`; the suspended render would
        // only handle `foo_b`.
        startTransition(() =>
          setState(() => ({ target: 'foo_b', suspend: true }))
        );
        await until(() => suspendedRenders > 0);
      }

      await chat!.sendMessage({ text: 'hi' }).catch(() => {});
      await wait(20);

      expect(chat!.error).toBeUndefined();
      expect(calls).toEqual(['foo_a']);
    } finally {
      (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    }
  }
);

test('the returned tools match with the matcher being rendered', () => {
  const seen: Array<[string, boolean]> = [];

  function Probe({ target }: { target: string }) {
    const chat = useChat<any>({
      agentId: 'inline-props-agent',
      disableTriggerValidation: true,
      requiresSearch: false,
      persistence: false,
      tools: {
        foo: {
          matchesToolName: (name: string) => name === target,
          onToolCall: () => {},
        },
      },
    } as any);
    seen.push([target, Boolean(chat.tools.foo.matchesToolName?.('foo_b'))]);

    return null;
  }

  const { rerender } = render(
    <InstantSearch searchClient={createSearchClient({})} indexName="indexName">
      <Probe target="foo_a" />
    </InstantSearch>
  );
  rerender(
    <InstantSearch searchClient={createSearchClient({})} indexName="indexName">
      <Probe target="foo_b" />
    </InstantSearch>
  );

  expect(seen.find(([target]) => target === 'foo_a')![1]).toBe(false);
  expect(seen.find(([target]) => target === 'foo_b')![1]).toBe(true);
});
