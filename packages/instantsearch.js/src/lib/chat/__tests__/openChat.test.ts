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

  test('marks a `__SHORTCUT_<id>__` message as a pending prompt shortcut', () => {
    const chat = createChatRenderState();

    openChat(chat, { message: '__SHORTCUT_size_guide__' });

    expect(chat.sendMessage).toHaveBeenCalledWith(
      {
        text: '__SHORTCUT_size_guide__',
        metadata: {
          promptShortcut: { sentinel: '__SHORTCUT_size_guide__' },
        },
      },
      undefined
    );
  });

  test.each(['__SHORTCUT_ab__', '__SHORTCUT_1abc__', 'hey __SHORTCUT_abc__'])(
    'leaves a message that is not exactly a shortcut token unmarked: %s',
    (message) => {
      const chat = createChatRenderState();

      openChat(chat, { message });

      expect(chat.sendMessage).toHaveBeenCalledWith(
        { text: message },
        undefined
      );
    }
  );

  describe('shortcut', () => {
    test('opens the chat, sends the shortcut token with its turn context and referer, and returns true', () => {
      const chat = createChatRenderState();
      const turnContext = { product_name: 'Trail Jacket' };

      const sent = openChat(chat, {
        shortcut: { id: 'size_guide' },
        turnContext,
        referer: 'result-card',
      });

      expect(sent).toBe(true);
      expect(chat.setOpen).toHaveBeenCalledWith(true);
      expect(chat.sendMessage).toHaveBeenCalledTimes(1);
      expect(chat.sendMessage).toHaveBeenCalledWith(
        {
          text: '__SHORTCUT_size_guide__',
          metadata: {
            turnContext,
            promptShortcut: { sentinel: '__SHORTCUT_size_guide__' },
          },
        },
        { headers: { 'x-algolia-referer': 'result-card' } }
      );
    });

    test('sends the token without turn context or referer when none is given', () => {
      const chat = createChatRenderState();

      openChat(chat, { shortcut: { id: 'size-guide-2' } });

      expect(chat.sendMessage).toHaveBeenCalledWith(
        {
          text: '__SHORTCUT_size-guide-2__',
          metadata: {
            promptShortcut: { sentinel: '__SHORTCUT_size-guide-2__' },
          },
        },
        undefined
      );
    });

    test('builds the token from the id only, whatever the turn context holds', () => {
      const chat = createChatRenderState();

      openChat(chat, {
        shortcut: { id: 'size_guide' },
        turnContext: { id: 'other', note: '__SHORTCUT_injected__' },
      });

      expect((chat.sendMessage as jest.Mock).mock.calls[0][0].text).toBe(
        '__SHORTCUT_size_guide__'
      );
    });

    test.each([
      ['a', `a${'b'.repeat(2)}`],
      ['the longest', `a${'b'.repeat(63)}`],
    ])('accepts %s valid id', (_, id) => {
      const chat = createChatRenderState();

      expect(openChat(chat, { shortcut: { id } })).toBe(true);
      expect((chat.sendMessage as jest.Mock).mock.calls[0][0].text).toBe(
        `__SHORTCUT_${id}__`
      );
    });

    test.each([
      ['too short', 'ab'],
      ['too long', `a${'b'.repeat(64)}`],
      ['starting with a digit', '1abc'],
      ['starting with an underscore', '_abc'],
      ['holding a space', 'size guide'],
      ['holding a token', '__SHORTCUT_abc__'],
      ['empty', ''],
      ['not a string', 123],
      ['not serializable', BigInt(10)],
      ['missing', undefined],
    ])(
      'sends nothing, keeps the chat closed and warns for an id %s',
      (_, id) => {
        const chat = createChatRenderState();
        let sent: boolean | undefined;

        expect(() => {
          sent = openChat(chat, {
            shortcut: { id: id as string },
            turnContext: { product_name: 'Trail Jacket' },
          });
        }).toWarnDev(
          `[InstantSearch.js]: The \`shortcut.id\` given to \`openChat\` is not a valid prompt shortcut id: ${
            typeof id === 'string' ? JSON.stringify(id) : typeof id
          }. It must start with a letter, followed by 2 to 63 letters, digits, underscores or hyphens. Nothing was sent.`
        );

        expect(sent).toBe(false);
        expect(chat.setOpen).not.toHaveBeenCalled();
        expect(chat.focusInput).not.toHaveBeenCalled();
        expect(chat.sendMessage).not.toHaveBeenCalled();
      }
    );

    test('sends the shortcut, ignores `message` and warns when both are given', () => {
      const chat = createChatRenderState();
      let sent: boolean | undefined;

      expect(() => {
        sent = openChat(chat, {
          shortcut: { id: 'size_guide' },
          message: 'macbook',
        });
      }).toWarnDev(
        '[InstantSearch.js]: `openChat` received both `shortcut` and `message`. The shortcut is sent and `message` is ignored.'
      );

      expect(sent).toBe(true);
      expect(chat.sendMessage).toHaveBeenCalledTimes(1);
      expect(chat.sendMessage).toHaveBeenCalledWith(
        {
          text: '__SHORTCUT_size_guide__',
          metadata: {
            promptShortcut: { sentinel: '__SHORTCUT_size_guide__' },
          },
        },
        undefined
      );
    });

    test('does not warn when sending a valid shortcut on its own', () => {
      const chat = createChatRenderState();

      expect(() => {
        openChat(chat, { shortcut: { id: 'size_guide' } });
      }).not.toWarnDev();
    });

    test.each(['submitted', 'streaming'] as const)(
      'opens but does not send while the chat is %s',
      (status) => {
        const chat = createChatRenderState({ status });

        const sent = openChat(chat, { shortcut: { id: 'size_guide' } });

        expect(sent).toBe(false);
        expect(chat.setOpen).toHaveBeenCalledWith(true);
        expect(chat.sendMessage).not.toHaveBeenCalled();
      }
    );

    test('opens but returns false when sendMessage is not provided', () => {
      const chat = createChatRenderState({ sendMessage: undefined });

      const sent = openChat(chat, { shortcut: { id: 'size_guide' } });

      expect(sent).toBe(false);
      expect(chat.setOpen).toHaveBeenCalledWith(true);
    });

    test('returns false when chatRenderState is undefined', () => {
      expect(openChat(undefined, { shortcut: { id: 'size_guide' } })).toBe(
        false
      );
    });
  });

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
