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

export function createGuardrailsTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('guardrails', () => {
    test('renders guardrail fallback as an assistant message', async () => {
      const searchClient = createSearchClient();
      const fallbackResponse =
        "I can't help with that request, but I can help with product questions.";

      const chat = new Chat({
        persistence: false,
        transport: {
          sendMessages: jest.fn(() =>
            Promise.resolve(
              chunksToStream([
                { type: 'start', messageId: 'assistant-1' },
                { type: 'text-start', id: 'text-1' },
                {
                  type: 'text-delta',
                  id: 'text-1',
                  delta: 'Unsafe partial content',
                },
                {
                  type: 'data-guardrail-violation',
                  data: {
                    category: 'blocked',
                    guardrailType: 'output',
                    fallbackResponse,
                  },
                },
                { type: 'finish' },
              ])
            )
          ),
          reconnectToStream: jest.fn(() => Promise.resolve(null)),
        },
      });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: createDefaultWidgetParams(chat),
          react: createDefaultWidgetParams(chat),
          vue: {},
        },
      });

      await openChat(act);

      userEvent.type(
        document.querySelector('.ais-ChatPrompt-textarea')!,
        'blocked request'
      );
      userEvent.click(document.querySelector('.ais-ChatPrompt-submit')!);

      await act(async () => {
        await wait(0);
        await wait(0);
      });

      const messagesContainer = document.querySelector('.ais-ChatMessages');
      expect(messagesContainer).toBeInTheDocument();
      expect(messagesContainer!.textContent).toContain(fallbackResponse);
      expect(messagesContainer!.textContent).not.toContain(
        'Unsafe partial content'
      );
      expect(
        document.querySelector('.ais-ChatMessageError')
      ).not.toBeInTheDocument();
    });
  });
}
