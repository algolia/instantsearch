/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { act, render } from '@testing-library/react';
import React from 'react';

import { InstantSearch } from '../../components/InstantSearch';
import { useChat } from '../useChat';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function createApp(
  onRender: (renders: number) => void,
  createProps: () => Record<string, unknown>
) {
  let renders = 0;

  function ChatProbe() {
    renders++;
    onRender(renders);

    const { status } = useChat<any>({
      agentId: 'inline-props-agent',
      disableTriggerValidation: true,
      requiresSearch: false,
      ...createProps(),
    } as any);

    return <span data-testid="probe" data-status={status} />;
  }

  return function App() {
    return (
      <InstantSearch
        searchClient={createSearchClient({})}
        indexName="indexName"
      >
        <ChatProbe />
      </InstantSearch>
    );
  };
}

describe('useChat with props created on every render', () => {
  test.each([
    ['tools', () => ({ tools: { search: { onToolCall: () => {} } } })],
    ['top-level functions', () => ({ sendAutomaticallyWhen: () => false })],
  ])(
    'does not re-render in a loop when %s are passed inline',
    async (_, createProps) => {
      let renders = 0;
      const App = createApp((count) => {
        renders = count;
      }, createProps);

      const { getByTestId } = render(<App />);
      await act(async () => {
        await wait(0);
      });

      expect(getByTestId('probe')).toBeInTheDocument();
      expect(renders).toBeLessThan(10);
    }
  );

  test('sends the context returned by the latest function', async () => {
    const bodies: string[] = [];
    let chat: ReturnType<typeof useChat> | undefined;

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

    const renderApp = (version: number) => (
      <InstantSearch
        searchClient={createSearchClient({})}
        indexName="indexName"
      >
        <Probe version={version} />
      </InstantSearch>
    );

    const { rerender } = render(renderApp(1));
    await act(async () => {
      await wait(0);
    });
    rerender(renderApp(2));
    await act(async () => {
      await wait(0);
    });
    await act(async () => {
      await chat!.sendMessage({ text: 'hi' }).catch(() => {});
      await wait(10);
    });

    expect(bodies.some((body) => body.includes('v2'))).toBe(true);
    expect(bodies.some((body) => body.includes('v1'))).toBe(false);
  });
});
