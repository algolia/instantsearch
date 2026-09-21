/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { act, render, screen, waitFor } from '@testing-library/react';
import { Chat } from 'instantsearch.js/es/lib/chat/chat';
import React from 'react';

import { InstantSearch } from '../../components/InstantSearch';
import { useChat } from '../useChat';
import { useChatTrigger } from '../useChatTrigger';

import type { UIMessage } from 'instantsearch.js/es/lib/chat';

function ChatProbe({ chat }: { chat: Chat<UIMessage> }) {
  const { open, status } = useChat<UIMessage>({
    chat,
    requiresSearch: false,
  } as any);

  return (
    <span data-testid="chat" data-open={String(open)} data-status={status} />
  );
}

function Entrypoint() {
  const { open, openChat, isChatBusy } = useChatTrigger();

  return (
    <button
      data-testid="entrypoint"
      data-open={String(open)}
      disabled={isChatBusy}
      onClick={() => openChat({ message: 'macbook', referer: 'hero-cta' })}
    />
  );
}

function App({ chat }: { chat: Chat<UIMessage> }) {
  return (
    <InstantSearch searchClient={createSearchClient()} indexName="indexName">
      <ChatProbe chat={chat} />
      <Entrypoint />
    </InstantSearch>
  );
}

function createChat() {
  return new Chat<UIMessage>({
    persistence: false,
    transport: {} as any,
  });
}

describe('useChatTrigger', () => {
  test('opens the chat and submits the message', async () => {
    const chat = createChat();
    const sendMessage = jest.fn();
    (chat as any).sendMessage = sendMessage;

    render(<App chat={chat} />);

    await waitFor(() =>
      expect(screen.getByTestId('chat')).toHaveAttribute('data-open', 'false')
    );

    await act(async () => {
      screen.getByTestId('entrypoint').click();
    });

    expect(sendMessage).toHaveBeenCalledWith(
      { text: 'macbook' },
      { headers: { 'x-algolia-referer': 'hero-cta' } }
    );
    expect(screen.getByTestId('chat')).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('entrypoint')).toHaveAttribute(
      'data-open',
      'true'
    );
  });

  test('reports the chat as busy while it is streaming', async () => {
    const chat = createChat();

    render(<App chat={chat} />);

    await waitFor(() => expect(screen.getByTestId('entrypoint')).toBeEnabled());

    await act(async () => {
      chat._state.status = 'streaming';
    });

    expect(screen.getByTestId('entrypoint')).toBeDisabled();

    await act(async () => {
      chat._state.status = 'ready';
    });

    expect(screen.getByTestId('entrypoint')).toBeEnabled();
  });

  test('submits to the chat mounted when it is called, not when it rendered', async () => {
    const chat = createChat();
    const sendMessage = jest.fn();
    (chat as any).sendMessage = sendMessage;
    let openChat: ReturnType<typeof useChatTrigger>['openChat'] | undefined;

    function CaptureCallback() {
      // Only the first callback, so the assertion fails if the connector
      // resolves the chat from the render the callback was created in.
      const { openChat: current } = useChatTrigger();
      openChat = openChat || current;
      return null;
    }

    // Captured before the chat is mounted.
    const { rerender } = render(
      <InstantSearch searchClient={createSearchClient()} indexName="indexName">
        <CaptureCallback />
      </InstantSearch>
    );

    rerender(
      <InstantSearch searchClient={createSearchClient()} indexName="indexName">
        <CaptureCallback />
        <ChatProbe chat={chat} />
      </InstantSearch>
    );

    await act(async () => {
      openChat!({ message: 'macbook' });
    });

    expect(sendMessage).toHaveBeenCalledWith({ text: 'macbook' }, undefined);
  });

  test('counts as an entry point for the chat trigger validation', async () => {
    const chat = createChat();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(<App chat={chat} />);

    await waitFor(() => expect(screen.getByTestId('chat')).toBeInTheDocument());

    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining('has no way to be opened')
    );

    warn.mockRestore();
  });
});
