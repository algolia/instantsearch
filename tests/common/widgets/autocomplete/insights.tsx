import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import React from 'react';

import type { AutocompleteWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { MockSearchClient } from '@instantsearch/mocks';
import type { SearchClient } from 'instantsearch.js';

declare const window: Window &
  typeof globalThis & {
    aa: jest.Mock;
  };

function createMockedSearchClient({
  hitsPerPage = 2,
  delay = 100,
}: { hitsPerPage?: number; delay?: number } = {}) {
  return createSearchClient({
    search: jest.fn(async (requests) => {
      await wait(delay);
      return createMultiSearchResponse(
        ...requests.map(
          ({ indexName }: Parameters<SearchClient['search']>[0][number]) =>
            createSingleSearchResponse({
              index: indexName,
              queryID: 'test-query-id',
              hits: Array.from({ length: hitsPerPage }).map((_, index) => ({
                objectID: `${indexName}-${index}`,
                name: `Item ${index}`,
              })),
            })
        )
      );
    }) as MockSearchClient['search'],
  });
}

export function createInsightsTests(
  setup: AutocompleteWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('insights', () => {
    test('sends a default click event when clicking an item', async () => {
      const delay = 100;
      const margin = 10;
      window.aa = Object.assign(jest.fn(), { version: '2.17.2' });
      const searchClient = createMockedSearchClient({ delay });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          insights: true,
        },
        widgetParams: {
          javascript: {
            indices: [
              {
                indexName: 'indexName',
                templates: {
                  item: (props) => props.item.name,
                },
              },
            ],
          },
          react: {
            indices: [
              {
                indexName: 'indexName',
                itemComponent: (props) => <>{props.item.name}</>,
              },
            ],
          },
          vue: {},
        },
      });

      // Wait for initial results
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      window.aa.mockClear();

      const items = document.querySelectorAll('.ais-AutocompleteIndexItem');
      expect(items.length).toBeGreaterThanOrEqual(1);

      userEvent.click(items[0]);

      expect(window.aa).toHaveBeenCalledTimes(1);
      expect(window.aa).toHaveBeenCalledWith(
        'clickedObjectIDsAfterSearch',
        {
          eventName: 'Hit Clicked',
          algoliaSource: ['instantsearch', 'instantsearch-internal'],
          index: 'indexName',
          objectIDs: ['indexName-0'],
          positions: [1],
          queryID: 'test-query-id',
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Algolia-API-Key': 'apiKey',
            'X-Algolia-Application-Id': 'appId',
          }),
        })
      );
    });

    test('sends a default click event on auxclick (middle mouse button)', async () => {
      const delay = 100;
      const margin = 10;
      window.aa = Object.assign(jest.fn(), { version: '2.17.2' });
      const searchClient = createMockedSearchClient({ delay });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          insights: true,
        },
        widgetParams: {
          javascript: {
            indices: [
              {
                indexName: 'indexName',
                templates: {
                  item: (props) => props.item.name,
                },
              },
            ],
          },
          react: {
            indices: [
              {
                indexName: 'indexName',
                itemComponent: (props) => <>{props.item.name}</>,
              },
            ],
          },
          vue: {},
        },
      });

      // Wait for initial results
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      window.aa.mockClear();

      const items = document.querySelectorAll('.ais-AutocompleteIndexItem');
      expect(items.length).toBeGreaterThanOrEqual(1);

      fireEvent(
        items[0],
        new MouseEvent('auxclick', {
          bubbles: true,
          cancelable: true,
          button: 1,
        })
      );

      expect(window.aa).toHaveBeenCalledTimes(1);
      expect(window.aa).toHaveBeenCalledWith(
        'clickedObjectIDsAfterSearch',
        {
          eventName: 'Hit Clicked',
          algoliaSource: ['instantsearch', 'instantsearch-internal'],
          index: 'indexName',
          objectIDs: ['indexName-0'],
          positions: [1],
          queryID: 'test-query-id',
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Algolia-API-Key': 'apiKey',
            'X-Algolia-Application-Id': 'appId',
          }),
        })
      );
    });

    test('sends a click event for the correct index', async () => {
      const delay = 100;
      const margin = 10;
      window.aa = Object.assign(jest.fn(), { version: '2.17.2' });
      const searchClient = createMockedSearchClient({ delay });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          insights: true,
        },
        widgetParams: {
          javascript: {
            indices: [
              {
                indexName: 'indexName',
                templates: {
                  item: (props) => props.item.name,
                },
              },
              {
                indexName: 'indexName2',
                templates: {
                  item: (props) => props.item.name,
                },
              },
            ],
          },
          react: {
            indices: [
              {
                indexName: 'indexName',
                itemComponent: (props) => <>{props.item.name}</>,
              },
              {
                indexName: 'indexName2',
                itemComponent: (props) => <>{props.item.name}</>,
              },
            ],
          },
          vue: {},
        },
      });

      // Wait for initial results
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      window.aa.mockClear();

      const allIndices = document.querySelectorAll('.ais-AutocompleteIndex');
      expect(allIndices.length).toBe(2);

      // Click the first item in the second index
      const secondIndexItems = allIndices[1].querySelectorAll(
        '.ais-AutocompleteIndexItem'
      );
      expect(secondIndexItems.length).toBeGreaterThanOrEqual(1);

      userEvent.click(secondIndexItems[0]);

      expect(window.aa).toHaveBeenCalledTimes(1);
      expect(window.aa).toHaveBeenCalledWith(
        'clickedObjectIDsAfterSearch',
        {
          eventName: 'Hit Clicked',
          algoliaSource: ['instantsearch', 'instantsearch-internal'],
          index: 'indexName2',
          objectIDs: ['indexName2-0'],
          positions: [1],
          queryID: 'test-query-id',
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Algolia-API-Key': 'apiKey',
            'X-Algolia-Application-Id': 'appId',
          }),
        })
      );
    });
  });
}
