/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { Chat, type UIMessage } from '../../chat/chat';
import { DefaultChatTransport } from '../transport';

describe('Chat error state (setStatus)', () => {
  function makeChat(): Chat<UIMessage> {
    return new Chat<UIMessage>({
      transport: new DefaultChatTransport({
        api: 'https://test.algolia.net/agent-studio/1/agents/x/completions',
      }),
    });
  }

  test('clears error when status leaves error (e.g. ready / submitted)', () => {
    const chat = makeChat();
    const setStatus = (chat as unknown as { setStatus: (p: unknown) => void })
      .setStatus.bind(chat);

    setStatus({
      status: 'error',
      error: new Error('first failure'),
    });
    expect(chat.error?.message).toBe('first failure');

    setStatus({ status: 'ready' });
    expect(chat.error).toBeUndefined();

    setStatus({
      status: 'error',
      error: new Error('second failure'),
    });
    expect(chat.error?.message).toBe('second failure');
  });

  test('clearError after error returns ready and clears error', () => {
    const chat = makeChat();
    const setStatus = (chat as unknown as { setStatus: (p: unknown) => void })
      .setStatus.bind(chat);

    setStatus({
      status: 'error',
      error: new Error('thread depth'),
    });
    expect(chat.status).toBe('error');

    chat.clearError();
    expect(chat.status).toBe('ready');
    expect(chat.error).toBeUndefined();
  });

  test('clones each Error so state never reuses the same reference across failures', () => {
    const chat = makeChat();
    const setStatus = (chat as unknown as { setStatus: (p: unknown) => void })
      .setStatus.bind(chat);

    const shared = new Error('first');
    setStatus({ status: 'error', error: shared });
    const storedFirst = chat.error;
    expect(storedFirst).not.toBe(shared);
    expect(storedFirst?.message).toBe('first');

    setStatus({ status: 'ready' });
    shared.message = 'second';
    setStatus({ status: 'error', error: shared });
    const storedSecond = chat.error;
    expect(storedSecond).not.toBe(shared);
    expect(storedSecond).not.toBe(storedFirst);
    expect(storedSecond?.message).toBe('second');
  });

  test('ignores failures tied to a previous conversation id after regenerateChatId', () => {
    const chat = makeChat();
    const handleError = (
      chat as unknown as {
        handleError: (
          e: Error,
          o?: { requestChatId?: string; requestAbortController?: AbortController }
        ) => void;
      }
    ).handleError.bind(chat);

    const previousId = chat.id;
    chat.regenerateChatId();
    expect(chat.id).not.toBe(previousId);

    handleError(new Error('late stale failure'), {
      requestChatId: previousId,
    });
    expect(chat.status).toBe('ready');
    expect(chat.error).toBeUndefined();
  });

  test('ignores handleError when the AbortController is no longer the active request', () => {
    const chat = makeChat();
    const handleError = (
      chat as unknown as {
        handleError: (
          e: Error,
          o?: { requestChatId?: string; requestAbortController?: AbortController }
        ) => void;
      }
    ).handleError.bind(chat);

    const staleController = new AbortController();
    (
      chat as unknown as {
        activeResponse: { abortController: AbortController } | null;
      }
    ).activeResponse = { abortController: new AbortController() };

    handleError(new Error('superseded request'), {
      requestChatId: chat.id,
      requestAbortController: staleController,
    });
    expect(chat.error).toBeUndefined();
    expect(chat.status).toBe('ready');
  });
});
