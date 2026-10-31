/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { act, render } from '@testing-library/react';
import React from 'react';

import { InstantSearch } from '../../components/InstantSearch';
import { useChat } from '../useChat';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const chatStream = (chunks: unknown[]) =>
  new Response(
    `${chunks
      .map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`)
      .join('')}data: [DONE]`,
    { headers: { 'Content-Type': 'text/event-stream' } }
  );

function renderChat(tool: Record<string, unknown>, calls: string[] = []) {
  let chat: ReturnType<typeof useChat> | undefined;

  function Probe() {
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
          ...tool,
          onToolCall: ({ addToolResult, toolCallId }: any) => {
            calls.push('foo');
            addToolResult({ output: 'ok', toolCallId });
          },
        },
      },
    } as any);
    return null;
  }

  render(
    <InstantSearch searchClient={createSearchClient({})} indexName="indexName">
      <Probe />
    </InstantSearch>
  );
  return () => chat!;
}

const methodMatcher = {
  streamInput: true,
  matchesToolName(this: any, name: string) {
    return Boolean(this.streamInput) && name === 'foo_a';
  },
};
const arrowMatcher = { matchesToolName: (name: string) => name === 'foo_a' };

test.each([
  ['a method matcher that reads `this`', methodMatcher],
  ['an arrow matcher', arrowMatcher],
])('the returned tools resolve with %s', (_name, tool) => {
  const getChat = renderChat(tool);
  const foo = getChat().tools.foo as any;
  expect(foo.matchesToolName('foo_a')).toBe(true);
  expect(foo.matchesToolName('foo_b')).toBe(false);
});

test.each([
  ['a method matcher that reads `this`', methodMatcher],
  ['an arrow matcher', arrowMatcher],
])('the connector runs a streamed tool call with %s', async (_name, tool) => {
  const calls: string[] = [];
  const getChat = renderChat(tool, calls);
  await act(async () => {
    await wait(0);
  });
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = false;
  try {
    await getChat()
      .sendMessage({ text: 'hi' })
      .catch(() => {});
    await wait(20);
    expect(getChat().error).toBeUndefined();
    expect(calls).toEqual(['foo']);
  } finally {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  }
});
