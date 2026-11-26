/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { Chat } from '../chat';
import { isChatBusy, openChat } from '../openChat';

import type { ChatRenderState } from '../../../connectors/chat/connectChat';
import type { UIMessage, UIMessageChunk } from '../../ai-lite/types';

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
    expect(chat.sendMessage).toHaveBeenCalledWith(
      { text: 'macbook' },
      undefined
    );
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

    expect(chat.sendMessage).toHaveBeenCalledWith(
      { text: 'macbook' },
      undefined
    );
  });

  test('marks a prompt-shortcut sentinel as pending so the chat shows no bubble for it', () => {
    const chat = createChatRenderState();

    openChat(chat, {
      message: ' __ALGOLIA_COMPARISON_algolia_comparison_abc__ ',
      turnContext: { selected_products: '[]' },
    });

    expect(chat.sendMessage).toHaveBeenCalledWith(
      {
        text: '__ALGOLIA_COMPARISON_algolia_comparison_abc__',
        metadata: {
          turnContext: { selected_products: '[]' },
          promptShortcut: {
            sentinel: '__ALGOLIA_COMPARISON_algolia_comparison_abc__',
          },
        },
      },
      undefined
    );
  });

  test.each([
    'hey __ALGOLIA_COMPARISON_abc__',
    '__ALGOLIA_COMPARISON_ab__',
    '__ALGOLIA_comparison_abc__',
    '__ALGOLIA_COMPARISON_abc',
  ])(
    'leaves a message that is not exactly a sentinel unmarked: %s',
    (message) => {
      const chat = createChatRenderState();

      openChat(chat, { message });

      expect(chat.sendMessage).toHaveBeenCalledWith(
        { text: message },
        undefined
      );
    }
  );

  test('does not add the x-algolia-referer header when no referer is provided', () => {
    const chat = createChatRenderState();

    openChat(chat, { message: 'macbook' });

    expect(chat.sendMessage).toHaveBeenCalledWith(
      { text: 'macbook' },
      undefined
    );
  });

  test('trims whitespace before sending', () => {
    const chat = createChatRenderState();

    openChat(chat, { message: '  macbook  ' });

    expect(chat.sendMessage).toHaveBeenCalledWith(
      { text: 'macbook' },
      undefined
    );
  });

  test('opens the chat and focuses the composer when message is empty', () => {
    const chat = createChatRenderState();

    const sent = openChat(chat, { message: '' });

    expect(sent).toBe(false);
    expect(chat.setOpen).not.toHaveBeenCalled();
    expect(chat.focusInput).toHaveBeenCalledTimes(1);
    expect(chat.sendMessage).not.toHaveBeenCalled();
  });

  test('treats a whitespace-only message as empty', () => {
    const chat = createChatRenderState();

    const sent = openChat(chat, { message: '   ' });

    expect(sent).toBe(false);
    expect(chat.setOpen).not.toHaveBeenCalled();
    expect(chat.focusInput).toHaveBeenCalledTimes(1);
    expect(chat.sendMessage).not.toHaveBeenCalled();
  });

  test('opens without a message when no options are provided', () => {
    const chat = createChatRenderState();

    const sent = openChat(chat);

    expect(sent).toBe(false);
    expect(chat.setOpen).not.toHaveBeenCalled();
    expect(chat.focusInput).toHaveBeenCalledTimes(1);
    expect(chat.sendMessage).not.toHaveBeenCalled();
  });

  test.each(['submitted', 'streaming'] as const)(
    'opens, hands the message to the chat, and returns true while the chat is %s',
    (status) => {
      const chat = createChatRenderState({ status });

      const sent = openChat(chat, { message: 'macbook' });

      expect(sent).toBe(true);
      expect(chat.setOpen).toHaveBeenCalledWith(true);
      expect(chat.sendMessage).toHaveBeenCalledWith(
        { text: 'macbook' },
        undefined
      );
    }
  );

  test('a message sent while a reply streams goes out after that reply', async () => {
    const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
    const waitFor = async (predicate: () => boolean) => {
      let guard = 0;
      while (!predicate() && guard < 500) {
        guard += 1;
        await tick();
      }
    };

    // The first reply stays open until the test ends it.
    let firstReply!: ReadableStreamDefaultController<UIMessageChunk>;
    let requestCount = 0;
    const sendMessages = jest.fn(() => {
      requestCount += 1;
      const messageId = `assistant-${requestCount}`;
      return Promise.resolve(
        new ReadableStream<UIMessageChunk>({
          start(controller) {
            controller.enqueue({ type: 'start', messageId });
            if (requestCount === 1) {
              firstReply = controller;
            } else {
              controller.enqueue({ type: 'finish' });
              controller.close();
            }
          },
        })
      );
    });
    const chat = new Chat<UIMessage>({
      persistence: false,
      transport: {
        sendMessages,
        reconnectToStream: () => Promise.resolve(null),
      },
    });
    const renderState = {
      get status() {
        return chat.status;
      },
      setOpen: jest.fn(),
      sendMessage: chat.sendMessage,
    } as Partial<ChatRenderState>;
    const userMessages = () =>
      chat.messages
        .filter((message) => message.role === 'user')
        .map((message) => (message.parts[0] as { text: string }).text);

    expect(openChat(renderState, { message: 'first' })).toBe(true);
    await waitFor(() => chat.status === 'streaming');

    expect(openChat(renderState, { message: 'second' })).toBe(true);
    await tick();

    expect(sendMessages).toHaveBeenCalledTimes(1);
    expect(userMessages()).toEqual(['first']);

    firstReply.enqueue({ type: 'finish' });
    firstReply.close();
    await waitFor(() => requestCount === 2 && chat.status === 'ready');

    expect(sendMessages).toHaveBeenCalledTimes(2);
    expect(chat.messages.map((message) => message.role)).toEqual([
      'user',
      'assistant',
      'user',
      'assistant',
    ]);
    expect(userMessages()).toEqual(['first', 'second']);
  });

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
