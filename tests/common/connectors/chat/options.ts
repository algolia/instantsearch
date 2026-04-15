import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { Chat } from 'instantsearch.js/src/lib/chat';

import { skippableDescribe } from '../../common';

import type { ChatConnectorSetup } from '.';
import type { SetupOptions, TestOptions } from '../../common';

export function createOptionsTests(
  setup: ChatConnectorSetup,
  { act, skippedTests }: Required<TestOptions>
) {
  skippableDescribe('options', skippedTests, () => {
    test('throws when no agentId or transport are provided', async () => {
      const options: SetupOptions<ChatConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {},
      };

      await expect(async () => {
        await setup(options);
      }).rejects.toThrowErrorMatchingInlineSnapshot(`
              "You need to provide either an \`agentId\` or a \`transport\`.

              See documentation: https://www.algolia.com/doc/api-reference/widgets/chat/js/#connector"
            `);
    });

    test('sends initialUserMessage on init', async () => {
      const chat = new Chat({});
      const sendMessageSpy = jest
        .spyOn(chat, 'sendMessage')
        .mockResolvedValue(undefined);

      const options: SetupOptions<ChatConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {
          chat,
          agentId: 'agentId',
          initialUserMessage: 'Hello, AI!',
        } as any,
      };

      await setup(options);

      await act(async () => {
        await wait(0);
      });

      expect(sendMessageSpy).toHaveBeenCalledWith({ text: 'Hello, AI!' });
    });

    test('does not send initialUserMessage when messages already exist', async () => {
      const chat = new Chat({
        messages: [
          {
            id: '1',
            role: 'user',
            parts: [{ type: 'text', text: 'Previous message' }],
          },
        ],
      });
      const sendMessageSpy = jest
        .spyOn(chat, 'sendMessage')
        .mockResolvedValue(undefined);

      const options: SetupOptions<ChatConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {
          chat,
          agentId: 'agentId',
          initialUserMessage: 'Hello, AI!',
        } as any,
      };

      await setup(options);

      await act(async () => {
        await wait(0);
      });

      expect(sendMessageSpy).not.toHaveBeenCalled();
    });

    test('sets initialMessages on init', async () => {
      const chat = new Chat({});

      const options: SetupOptions<ChatConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {
          chat,
          agentId: 'agentId',
          initialMessages: [
            {
              id: '1',
              role: 'assistant',
              parts: [{ type: 'text', text: 'Welcome! How can I help?' }],
            },
          ],
        } as any,
      };

      await setup(options);

      await act(async () => {
        await wait(0);
      });

      expect(chat.messages).toHaveLength(1);
      expect(chat.messages[0]).toEqual(
        expect.objectContaining({
          role: 'assistant',
          parts: [{ type: 'text', text: 'Welcome! How can I help?' }],
        })
      );
    });

    test('does not set initialMessages when messages already exist', async () => {
      const chat = new Chat({
        messages: [
          {
            id: '1',
            role: 'user',
            parts: [{ type: 'text', text: 'Previous message' }],
          },
        ],
      });

      const options: SetupOptions<ChatConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {
          chat,
          agentId: 'agentId',
          initialMessages: [
            {
              id: '2',
              role: 'assistant',
              parts: [{ type: 'text', text: 'Welcome! How can I help?' }],
            },
          ],
        } as any,
      };

      await setup(options);

      await act(async () => {
        await wait(0);
      });

      expect(chat.messages).toHaveLength(1);
      expect(chat.messages[0]).toEqual(
        expect.objectContaining({
          role: 'user',
          parts: [{ type: 'text', text: 'Previous message' }],
        })
      );
    });

    test('applies initialMessages and sends initialUserMessage together', async () => {
      sessionStorage.clear();
      const chat = new Chat({});
      const sendMessageSpy = jest
        .spyOn(chat, 'sendMessage')
        .mockResolvedValue(undefined);

      const options: SetupOptions<ChatConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {
          chat,
          agentId: 'agentId',
          initialMessages: [
            {
              id: '1',
              role: 'assistant',
              parts: [{ type: 'text', text: 'Welcome! How can I help?' }],
            },
          ],
          initialUserMessage: 'Hello, AI!',
        } as any,
      };

      await setup(options);

      await act(async () => {
        await wait(0);
      });

      expect(chat.messages).toHaveLength(1);
      expect(chat.messages[0]).toEqual(
        expect.objectContaining({
          role: 'assistant',
          parts: [{ type: 'text', text: 'Welcome! How can I help?' }],
        })
      );
      expect(sendMessageSpy).toHaveBeenCalledWith({ text: 'Hello, AI!' });
    });

    test('provides `input` state to persist text input', async () => {
      const options: SetupOptions<ChatConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {
          agentId: 'agentId',
        },
      };

      await setup(options);

      expect(screen.getByTestId('Chat-input')).toHaveValue('');

      userEvent.click(screen.getByTestId('Chat-updateInput'));

      await act(async () => {
        await wait(0);
      });

      expect(screen.getByTestId('Chat-input')).toHaveValue('hello world');
    });

    test('provides `open` state to toggle chat visibility', async () => {
      const options: SetupOptions<ChatConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {
          agentId: 'agentId',
        },
      };

      await setup(options);

      expect(screen.getByTestId('Chat-root')).not.toBeVisible();

      userEvent.click(screen.getByTestId('Chat-toggleButton'));

      await act(async () => {
        await wait(0);
      });

      expect(screen.getByTestId('Chat-root')).toBeVisible();
    });

    test('exposes `sendChatMessageFeedback` when `feedback` is enabled', async () => {
      const options: SetupOptions<ChatConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {
          agentId: 'agentId',
          feedback: true,
        },
      };

      await setup(options);

      expect(screen.getByTestId('Chat-hasFeedback')).toHaveTextContent('true');
      expect(screen.getByTestId('Chat-feedbackState')).toHaveTextContent('{}');
    });

    test('does not expose `sendChatMessageFeedback` when `feedback` is not enabled', async () => {
      const options: SetupOptions<ChatConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {
          agentId: 'agentId',
        },
      };

      await setup(options);

      expect(screen.getByTestId('Chat-hasFeedback')).toHaveTextContent(
        'false'
      );
    });
  });
}
