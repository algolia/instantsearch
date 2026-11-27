import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';
import { Chat } from 'instantsearch.js/es/lib/chat';

import { createDefaultWidgetParams, openChat } from './utils';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { UIMessageChunk } from 'instantsearch.js/es/lib/ai-lite';

export function createQueueTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('queue', () => {
    test('shows a message sent while a reply runs, lets it be removed, and sends the rest after the reply', async () => {
      const searchClient = createSearchClient();
      // Each reply stays open until the test ends it.
      const replies: Array<ReadableStreamDefaultController<UIMessageChunk>> =
        [];
      const sendMessages = jest.fn(() =>
        Promise.resolve(
          new ReadableStream<UIMessageChunk>({
            start(controller) {
              controller.enqueue({
                type: 'start',
                messageId: `assistant-${replies.length + 1}`,
              });
              replies.push(controller);
            },
          })
        )
      );
      const chat = new Chat({
        persistence: false,
        transport: {
          sendMessages,
          reconnectToStream: jest.fn(() => Promise.resolve(null)),
        },
      });

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: createDefaultWidgetParams(chat),
          react: createDefaultWidgetParams(chat),
          vue: createDefaultWidgetParams(chat),
        },
      });

      await openChat(act);

      const send = async (text: string) => {
        userEvent.type(
          document.querySelector('.ais-ChatPrompt-textarea')!,
          text
        );
        await act(async () => {
          await wait(0);
        });
        userEvent.type(
          document.querySelector('.ais-ChatPrompt-textarea')!,
          '{enter}'
        );
        await act(async () => {
          await wait(0);
          await wait(0);
        });
      };
      const queuedTexts = () =>
        Array.from(document.querySelectorAll('.ais-ChatMessage--queued')).map(
          (bubble) =>
            bubble.querySelector('.ais-ChatMessage-message')!.textContent
        );

      await send('first');
      expect(chat.status).toBe('streaming');

      await send('second');
      await send('third');

      // Enter queued them instead of stopping the reply.
      expect(chat.status).toBe('streaming');
      expect(sendMessages).toHaveBeenCalledTimes(1);
      expect(queuedTexts()).toEqual(['second', 'third']);

      userEvent.click(
        document.querySelector<HTMLButtonElement>(
          '.ais-ChatMessage--queued .ais-ChatMessage-removeQueued'
        )!
      );
      await act(async () => {
        await wait(0);
      });

      expect(queuedTexts()).toEqual(['third']);

      await act(async () => {
        replies[0].enqueue({ type: 'finish' });
        replies[0].close();
        await wait(0);
        await wait(0);
        await wait(0);
      });

      expect(sendMessages).toHaveBeenCalledTimes(2);
      expect(queuedTexts()).toEqual([]);
      expect(
        chat.messages
          .filter((message) => message.role === 'user')
          .map((message) => (message.parts[0] as { text: string }).text)
      ).toEqual(['first', 'third']);
    });
  });
}
