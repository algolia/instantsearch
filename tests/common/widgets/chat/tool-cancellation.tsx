import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';
import { Chat } from 'instantsearch.js/es/lib/chat';

import { createDefaultWidgetParams, openChat } from './utils';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { UIMessageChunk } from 'instantsearch.js/es/lib/ai-lite';

function chunksToStream(
  chunks: UIMessageChunk[]
): ReadableStream<UIMessageChunk> {
  return new ReadableStream({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk));
      controller.close();
    },
  });
}

// A turn that hands a client-side tool call to the frontend and stops there:
// the output is the user's to provide, by interacting with the rendered card.
const pendingToolCallChunks: UIMessageChunk[] = [
  { type: 'start', messageId: 'assistant-1' },
  { type: 'text-start', id: 'text-1' },
  { type: 'text-delta', id: 'text-1', delta: 'Confirm the purchase?' },
  {
    type: 'tool-input-available',
    toolName: 'confirm',
    toolCallId: 'tool-call-1',
    input: { sku: 'A1' },
  },
  { type: 'finish' },
];

const answeredChunks: UIMessageChunk[] = [
  { type: 'start', messageId: 'assistant-2' },
  { type: 'text-start', id: 'text-2' },
  { type: 'text-delta', id: 'text-2', delta: 'Here are other options.' },
  { type: 'finish' },
];

async function submitPrompt(
  text: string,
  act: Required<TestOptions>['act']
): Promise<void> {
  userEvent.type(document.querySelector('.ais-ChatPrompt-textarea')!, text);
  userEvent.click(document.querySelector('.ais-ChatPrompt-submit')!);

  await act(async () => {
    await wait(0);
    await wait(0);
  });
}

export function createToolCancellationTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('pending tool call cancellation', () => {
    test('keeps sending after the user ignores a client-side tool call', async () => {
      const searchClient = createSearchClient();
      let requestIndex = 0;
      const sendMessages = jest.fn((_options: unknown) => {
        const chunks =
          requestIndex === 0 ? pendingToolCallChunks : answeredChunks;
        requestIndex++;
        return Promise.resolve(chunksToStream(chunks));
      });

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
          vue: {},
        },
      });

      await openChat(act);

      await submitPrompt('buy the first one', act);

      // The tool call was handed over and is waiting for an output.
      expect(chat.messages[1].parts).toContainEqual(
        expect.objectContaining({
          toolCallId: 'tool-call-1',
          state: 'input-available',
        })
      );

      // Instead of interacting with the card, the user asks something else.
      await submitPrompt('actually, show me something else', act);

      const sentMessages = (
        sendMessages.mock.calls[1][0] as {
          messages: Array<{ parts: Array<Record<string, unknown>> }>;
        }
      ).messages;
      const sentToolParts = sentMessages
        .flatMap((message) => message.parts)
        .filter((part) => 'toolCallId' in part);

      // Every tool call in the payload is answered, so the request is valid and
      // the conversation stays usable instead of erroring out for good.
      expect(sentToolParts).toEqual([
        expect.objectContaining({
          toolCallId: 'tool-call-1',
          state: 'output-error',
        }),
      ]);
      // The repair stays on the wire: the card is still mounted, so answering
      // it after the send must still work.
      expect(chat.messages[1].parts).toContainEqual(
        expect.objectContaining({
          toolCallId: 'tool-call-1',
          state: 'input-available',
        })
      );
      expect(chat.status).toBe('ready');
      expect(
        document.querySelector('.ais-ChatMessageError')
      ).not.toBeInTheDocument();
      expect(
        document.querySelector('.ais-ChatMessages')!.textContent
      ).toContain('Here are other options.');
    });
  });
}
