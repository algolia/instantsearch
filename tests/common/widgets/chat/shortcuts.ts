import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { waitFor } from '@testing-library/dom';

import type { ChatWidgetSetup, OpenChatFromTrigger } from '.';
import type { TestOptions } from '../../common';
import type { UIMessageChunk } from 'instantsearch.js/es/lib/ai-lite';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';

const TOKEN = '__SHORTCUT_size_guide__';
const DISPLAY_TEXT = 'What size should I get?';
const REPLY = 'A medium should fit.';

function chunksToResponse(chunks: UIMessageChunk[]): Response {
  return new Response(
    `${chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join('')}data: [DONE]\n\n`,
    { headers: { 'Content-Type': 'text/event-stream' } }
  );
}

export function createShortcutsTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('prompt shortcuts', () => {
    test('sends a shortcut from the trigger as its token and never shows the token', async () => {
      const searchClient = createSearchClient();
      const turnContext = { product_name: 'Trail Jacket' };
      let answer: (response: Response) => void = () => {};
      const fetchMock = jest.fn(
        () =>
          new Promise<Response>((resolve) => {
            answer = resolve;
          })
      );
      const transport = { api: '/api', fetch: fetchMock };
      let openChat: OpenChatFromTrigger = () => false;
      const captureOpenChat = (current: OpenChatFromTrigger) => {
        openChat = current;
      };
      const widgetParams = { transport, persistence: false, captureOpenChat };

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: widgetParams,
          react: widgetParams,
          vue: widgetParams,
        },
      });

      await act(async () => {
        await wait(0);
      });

      let sent = false;
      await act(async () => {
        sent = openChat({ shortcut: { id: 'size_guide' }, turnContext });
        await wait(0);
      });

      expect(sent).toBe(true);
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      const [, request] = fetchMock.mock.calls[0] as unknown as [
        unknown,
        { body: string },
      ];
      const sentMessages = JSON.parse(request.body).messages as UIMessage[];
      expect(sentMessages).toHaveLength(1);
      expect(sentMessages[0].role).toBe('user');
      expect(sentMessages[0].parts).toEqual([{ type: 'text', text: TOKEN }]);
      expect(sentMessages[0].metadata).toEqual({ turnContext });

      // The answer is still on its way: no bubble for the token.
      const messages = document.querySelector('.ais-ChatMessages')!;
      expect(messages).toBeInTheDocument();
      expect(messages.textContent).not.toContain('__SHORTCUT_');

      await act(async () => {
        answer(
          chunksToResponse([
            { type: 'start', messageId: 'assistant-1' },
            {
              type: 'data-prompt-shortcut',
              data: { sentinel: TOKEN, displayText: DISPLAY_TEXT },
              transient: true,
            },
            { type: 'text-start', id: 'text-1' },
            { type: 'text-delta', id: 'text-1', delta: REPLY },
            { type: 'text-end', id: 'text-1' },
            { type: 'finish' },
          ] as UIMessageChunk[])
        );
        await wait(0);
      });

      await waitFor(() => {
        expect(messages.textContent).toContain(REPLY);
      });

      expect(messages.textContent).toContain(DISPLAY_TEXT);
      expect(messages.textContent).not.toContain('__SHORTCUT_');
      expect(
        document.querySelector('.ais-ChatMessageError')
      ).not.toBeInTheDocument();
    });
  });
}
