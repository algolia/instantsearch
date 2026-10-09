import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { Chat, SearchIndexToolType } from 'instantsearch.js/es/lib/chat';

import { createDefaultWidgetParams, openChat } from '../chat/utils';

import type { InstantSearchBaseWidgetSetup } from '.';
import type { TestOptions } from '../../common';

type InsightsClient = jest.Mock & { version: string };

function createChatWithSearchResults({ queryID }: { queryID?: string } = {}) {
  return new Chat({
    messages: [
      {
        id: 'assistant-message-id',
        role: 'assistant',
        parts: [
          {
            type: `tool-${SearchIndexToolType}`,
            toolCallId: 'search-call-id',
            input: { query: 'test', number_of_results: 2 },
            state: 'output-available',
            output: {
              hits: [
                {
                  objectID: '123',
                  name: 'Product 123',
                  __position: 1,
                  ...(queryID ? { __queryID: queryID } : {}),
                },
                { objectID: '456', name: 'Product 456', __position: 2 },
              ],
              nbHits: 100,
            },
          },
        ],
      },
    ],
    id: 'chat-id',
  });
}

export function createInsightsTests(
  setup: InstantSearchBaseWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('insights middleware', () => {
    let insightsClient: InsightsClient;

    beforeEach(() => {
      insightsClient = Object.assign(jest.fn(), {
        version: '2.17.2',
      }) as InsightsClient;
      (window as any).aa = insightsClient;
    });

    afterEach(() => {
      delete (window as any).aa;
    });

    function widgetParams({
      chat,
      insights,
    }: {
      chat: Chat<any>;
      insights: boolean;
    }) {
      return {
        javascript: { chat: createDefaultWidgetParams(chat), insights },
        react: { chat: createDefaultWidgetParams(chat), insights },
        vue: {},
      };
    }

    test('sends a click event with the index and credentials of the provider', async () => {
      const searchClient = createSearchClient();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: widgetParams({
          chat: createChatWithSearchResults(),
          insights: true,
        }),
      });

      await openChat(act);

      insightsClient.mockClear();

      const carouselItem = document.querySelector('.ais-Carousel-item');
      expect(carouselItem).toBeInTheDocument();

      userEvent.click(carouselItem!);

      await act(async () => {
        await wait(0);
      });

      expect(insightsClient).toHaveBeenCalledWith(
        'clickedObjectIDsAfterSearch',
        expect.objectContaining({
          eventName: 'Item Clicked',
          index: 'indexName',
          objectIDs: ['123'],
          positions: [1],
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Algolia-API-Key': 'apiKey',
            'X-Algolia-Application-Id': 'appId',
          }),
        })
      );
      expect(searchClient.search).not.toHaveBeenCalled();
    });

    test('sends an items_shown view event when the results render', async () => {
      const searchClient = createSearchClient();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: widgetParams({
          chat: createChatWithSearchResults({ queryID: 'search-query-id' }),
          insights: true,
        }),
      });

      insightsClient.mockClear();

      await openChat(act);

      await waitFor(() => {
        expect(
          insightsClient.mock.calls.filter(
            ([method]: [string]) => method === 'viewedObjectIDs'
          )
        ).toHaveLength(1);
      });
      expect(insightsClient).toHaveBeenCalledWith(
        'viewedObjectIDs',
        expect.objectContaining({
          eventName: 'items_shown',
          index: 'indexName',
          objectIDs: ['123', '456'],
          queryID: 'message_assistant-message-id',
          toolCallId: 'search-call-id',
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Algolia-API-Key': 'apiKey',
            'X-Algolia-Application-Id': 'appId',
          }),
        })
      );
    });

    test('sends no events without the insights middleware', async () => {
      const searchClient = createSearchClient();

      await setup({
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: widgetParams({
          chat: createChatWithSearchResults({ queryID: 'search-query-id' }),
          insights: false,
        }),
      });

      await openChat(act);

      userEvent.click(document.querySelector('.ais-Carousel-item')!);

      await act(async () => {
        await wait(0);
      });

      expect(insightsClient).not.toHaveBeenCalledWith(
        'clickedObjectIDsAfterSearch',
        expect.anything(),
        expect.anything()
      );
      expect(insightsClient).not.toHaveBeenCalledWith(
        'viewedObjectIDs',
        expect.anything(),
        expect.anything()
      );
    });
  });
}
