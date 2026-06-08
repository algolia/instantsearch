import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { Chat } from 'instantsearch.js/es/lib/chat';

import { createDefaultWidgetParams, openChat } from './utils';

import type { ChatWidgetSetup } from '.';
import type { TestOptions } from '../../common';

// A finished assistant message holding a search-tool carousel.
const carouselMessage = () => ({
  id: 'm1',
  role: 'assistant' as const,
  parts: [
    {
      type: 'tool-algolia_search_index' as const,
      toolCallId: 'tool-call-1',
      state: 'output-available' as const,
      input: { query: 'products' },
      output: {
        hits: [
          { objectID: '1', name: 'Product 1', __position: 1 },
          { objectID: '2', name: 'Product 2', __position: 2 },
          { objectID: '3', name: 'Product 3', __position: 3 },
        ],
        nbHits: 100,
      },
    },
  ],
});

export function createStreamingTests(
  setup: ChatWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('streaming re-renders', () => {
    test('keeps the streaming carousel mounted (and its scroll position) across deltas', async () => {
      const searchClient = createSearchClient();
      // A single carousel message that is itself updated on every delta — i.e.
      // the message currently being streamed. `replaceMessage` hands the widget
      // a fresh message object each delta, so the row genuinely re-renders;
      // whether its `<ol>` survives depends on the tool component keeping a
      // stable identity across renders.
      const chat = new Chat({ messages: [carouselMessage()] } as any);

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          javascript: createDefaultWidgetParams(chat),
          react: createDefaultWidgetParams(chat),
          vue: {},
        },
      });

      await openChat(act);

      const listBefore = document.querySelector<HTMLOListElement>(
        '.ais-Carousel-list'
      );
      expect(listBefore).not.toBeNull();

      // Simulate the user having scrolled the carousel horizontally.
      listBefore!.scrollLeft = 240;

      // Each delta replaces the carousel message with a fresh object holding the
      // same hits — exactly what a streaming tool result does.
      for (let i = 0; i < 3; i++) {
        // eslint-disable-next-line no-await-in-loop
        await act(async () => {
          chat.messages = [carouselMessage()];
          await wait(0);
        });
      }

      const listAfter = document.querySelector<HTMLOListElement>(
        '.ais-Carousel-list'
      );

      // Same DOM node across re-renders → native scroll position survives.
      expect(listAfter).toBe(listBefore);
      expect(listAfter!.scrollLeft).toBe(240);
    });
  });
}
