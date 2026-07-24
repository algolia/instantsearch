/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { isChatBusy, openChat } from '../openChat';

import type { ChatRenderState } from '../../../connectors/chat/connectChat';

function createChatRenderState(
  overrides: Partial<ChatRenderState> = {}
): Partial<ChatRenderState> {
  return {
    status: 'ready',
    setOpen: jest.fn(),
    focusInput: jest.fn(),
    sendMessage: jest.fn(),
    ...overrides,
  };
}

describe('openChat', () => {
  test('opens the chat, sends the message, and returns true', () => {
    const chat = createChatRenderState();

    const sent = openChat(chat, { message: 'macbook' });

    expect(sent).toBe(true);
    expect(chat.setOpen).toHaveBeenCalledWith(true);
    expect(chat.sendMessage).toHaveBeenCalledWith({ text: 'macbook' }, undefined);
  });

  test.each([
    'ai-mode',
    'prompt-suggestions-widget',
    'prompt-suggestions-autocomplete',
  ] as const)(
    'forwards the `%s` referer as the x-algolia-referer header',
    (referer) => {
      const chat = createChatRenderState();

      openChat(chat, { message: 'macbook', referer });

      expect(chat.sendMessage).toHaveBeenCalledWith(
        { text: 'macbook' },
        { headers: { 'x-algolia-referer': referer } }
      );
    }
  );

  test('attaches turnContext to the message metadata when provided', () => {
    const chat = createChatRenderState();

    openChat(chat, {
      message: 'macbook',
      turnContext: { query: 'macbook', page: 'plp' },
    });

    expect(chat.sendMessage).toHaveBeenCalledWith(
      {
        text: 'macbook',
        metadata: { turnContext: { query: 'macbook', page: 'plp' } },
      },
      undefined
    );
  });

  test('omits the metadata key entirely when no turnContext is provided', () => {
    const chat = createChatRenderState();

    openChat(chat, { message: 'macbook' });

    expect(chat.sendMessage).toHaveBeenCalledWith({ text: 'macbook' }, undefined);
  });

  test('does not add the x-algolia-referer header when no referer is provided', () => {
    const chat = createChatRenderState();

    openChat(chat, { message: 'macbook' });

    expect(chat.sendMessage).toHaveBeenCalledWith({ text: 'macbook' }, undefined);
  });

  test('trims whitespace before sending', () => {
    const chat = createChatRenderState();

    openChat(chat, { message: '  macbook  ' });

    expect(chat.sendMessage).toHaveBeenCalledWith({ text: 'macbook' }, undefined);
  });

  test('opens the chat and focuses the composer when message is empty', () => {
    const chat = createChatRenderState();

    const sent = openChat(chat, { message: '' });

    expect(sent).toBe(false);
    expect(chat.setOpen).toHaveBeenCalledWith(true);
    expect(chat.focusInput).toHaveBeenCalledTimes(1);
    expect(chat.sendMessage).not.toHaveBeenCalled();
  });

  test('treats a whitespace-only message as empty', () => {
    const chat = createChatRenderState();

    const sent = openChat(chat, { message: '   ' });

    expect(sent).toBe(false);
    expect(chat.setOpen).toHaveBeenCalledWith(true);
    expect(chat.focusInput).toHaveBeenCalledTimes(1);
    expect(chat.sendMessage).not.toHaveBeenCalled();
  });

  test('opens without a message when no options are provided', () => {
    const chat = createChatRenderState();

    const sent = openChat(chat);

    expect(sent).toBe(false);
    expect(chat.setOpen).toHaveBeenCalledWith(true);
    expect(chat.focusInput).toHaveBeenCalledTimes(1);
    expect(chat.sendMessage).not.toHaveBeenCalled();
  });

  test.each(['submitted', 'streaming'] as const)(
    'opens but does not send while the chat is %s',
    (status) => {
      const chat = createChatRenderState({ status });

      const sent = openChat(chat, { message: 'macbook' });

      expect(sent).toBe(false);
      expect(chat.setOpen).toHaveBeenCalledWith(true);
      expect(chat.sendMessage).not.toHaveBeenCalled();
    }
  );

  test('returns false when chatRenderState is undefined', () => {
    expect(openChat(undefined, { message: 'macbook' })).toBe(false);
  });

  test('returns false when sendMessage is not provided on the render state', () => {
    const chat = createChatRenderState({ sendMessage: undefined });

    const sent = openChat(chat, { message: 'macbook' });

    expect(sent).toBe(false);
    expect(chat.setOpen).toHaveBeenCalledWith(true);
  });
});

describe('isChatBusy', () => {
  test.each(['submitted', 'streaming'] as const)(
    'returns true when status is %s',
    (status) => {
      expect(isChatBusy(createChatRenderState({ status }))).toBe(true);
    }
  );

  test.each(['ready', 'error'] as const)(
    'returns false when status is %s',
    (status) => {
      expect(isChatBusy(createChatRenderState({ status }))).toBe(false);
    }
  );

  test('returns false when chatRenderState is undefined', () => {
    expect(isChatBusy(undefined)).toBe(false);
  });
});
