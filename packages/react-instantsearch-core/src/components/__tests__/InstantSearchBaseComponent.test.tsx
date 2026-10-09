/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { StrictMode, useEffect } from 'react';

import { useChat } from '../../connectors/useChat';
import { useChatTrigger } from '../../connectors/useChatTrigger';
import { useInstantSearch } from '../../hooks/useInstantSearch';
import { InstantSearchBase } from '../InstantSearchBase';

import type { Middleware } from 'instantsearch.js';

function ChatWithTrigger() {
  const { open } = useChat({
    agentId: 'agentId',
    persistence: false,
    requiresSearch: false,
  });
  const { toggleOpen } = useChatTrigger();

  return (
    <>
      <span data-testid="open">{String(open)}</span>
      <button onClick={toggleOpen}>Toggle</button>
    </>
  );
}

function createRecordingMiddleware() {
  const calls: string[] = [];
  const middleware: Middleware = () => ({
    $$type: 'recording',
    subscribe() {
      calls.push('subscribe');
    },
    started() {
      calls.push('started');
    },
    unsubscribe() {
      calls.push('unsubscribe');
    },
    onStateChange() {},
  });

  return { calls, middleware };
}

describe('InstantSearchBase', () => {
  test('renders its children', () => {
    render(
      <InstantSearchBase searchClient={{ appId: 'appId', apiKey: 'apiKey' }}>
        <p>hello</p>
      </InstantSearchBase>
    );

    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  test('lets the chat hooks talk to each other without searching', async () => {
    const searchClient = createSearchClient();

    render(
      <InstantSearchBase searchClient={searchClient}>
        <ChatWithTrigger />
      </InstantSearchBase>
    );

    expect(screen.getByTestId('open')).toHaveTextContent('false');

    userEvent.click(screen.getByText('Toggle'));
    await act(async () => {
      await wait(0);
    });

    expect(screen.getByTestId('open')).toHaveTextContent('true');
    expect(searchClient.search).not.toHaveBeenCalled();
  });

  test('exposes the main index to `useInstantSearch`', () => {
    let api: ReturnType<typeof useInstantSearch> | undefined;

    function Probe() {
      api = useInstantSearch();
      return null;
    }

    render(
      <InstantSearchBase
        searchClient={{ appId: 'appId', apiKey: 'apiKey' }}
        indexName="indexName"
      >
        <Probe />
      </InstantSearchBase>
    );

    expect(api!.status).toBe('idle');
    expect(api!.error).toBeUndefined();
    expect(Object.keys(api!.uiState)).toEqual(['instantSearchBase']);
  });

  test('adds middleware with `addMiddlewares`, and removes it on cleanup', () => {
    const { calls, middleware } = createRecordingMiddleware();

    function AddMiddleware() {
      const { addMiddlewares } = useInstantSearch();
      useEffect(() => addMiddlewares(middleware), [addMiddlewares]);
      return null;
    }

    const { unmount } = render(
      <InstantSearchBase searchClient={{ appId: 'appId', apiKey: 'apiKey' }}>
        <AddMiddleware />
      </InstantSearchBase>
    );

    expect(calls).toEqual(['subscribe', 'started']);

    unmount();

    expect(calls).toEqual(['subscribe', 'started', 'unsubscribe']);
  });

  test('disposes of the provider once unmounted, but not in Strict Mode', async () => {
    const { calls, middleware } = createRecordingMiddleware();

    function AddMiddleware() {
      const { addMiddlewares } = useInstantSearch();
      useEffect(() => {
        addMiddlewares(middleware);
        // Not cleaned up on purpose: the provider is what disposes of it.
      }, [addMiddlewares]);
      return null;
    }

    const { unmount } = render(
      <StrictMode>
        <InstantSearchBase searchClient={{ appId: 'appId', apiKey: 'apiKey' }}>
          <AddMiddleware />
        </InstantSearchBase>
      </StrictMode>
    );

    await act(async () => {
      await wait(0);
    });

    // Strict Mode mounts twice, but the provider is only started once.
    expect(calls.filter((call) => call === 'unsubscribe')).toHaveLength(0);

    unmount();
    await act(async () => {
      await wait(0);
    });

    expect(
      calls.filter((call) => call === 'unsubscribe').length
    ).toBeGreaterThan(0);
  });
});
