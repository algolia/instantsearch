import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { skippableDescribe } from '../../common';

import type { RefinementSuggestionsConnectorSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptionsTests(
  setup: RefinementSuggestionsConnectorSetup,
  { act, skippedTests }: Required<TestOptions>
) {
  skippableDescribe('options', skippedTests, () => {
    test('requires agentId', () => {
      const searchClient = createSearchClient({});

      expect(() =>
        setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            agentId: '',
          } as any,
        })
      ).toThrow('The `agentId` option is required.');
    });

    test('initializes with valid agentId', async () => {
      const searchClient = createSearchClient({});

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          agentId: 'test-agent-id',
        },
      });

      await act(async () => {
        await wait(0);
      });

      // Should perform initial search
      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenCalledWith([
        expect.objectContaining({
          indexName: 'indexName',
          params: expect.any(Object),
        }),
      ]);
    });

    test('uses correct hitsToSample parameter', async () => {
      const searchClient = createSearchClientWithHits();

      mockFetch();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          agentId: 'test-agent-id',
          hitsToSample: 1,
          debounceMs: 0,
        },
      });

      await act(async () => {
        await wait(10);
      });

      expect(getSentMessage()).toEqual({
        text: JSON.stringify({
          query: 'query',
          facets: {
            brand: { Apple: 10, Samsung: 5 },
            category: { Phones: 8, Laptops: 7 },
          },
          hitsSample: [{ objectID: '1', name: 'Product 1' }],
          currentRefinements: [],
          maxSuggestions: 3,
        }),
        type: 'text',
      });
    });

    test('sends maxSuggestions parameter', async () => {
      const searchClient = createSearchClientWithHits();

      mockFetch();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          agentId: 'test-agent-id',
          maxSuggestions: 1,
          debounceMs: 0,
        },
      });

      await act(async () => {
        await wait(10);
      });

      expect(getSentMessage()).toEqual({
        text: JSON.stringify({
          query: 'query',
          facets: {
            brand: { Apple: 10, Samsung: 5 },
            category: { Phones: 8, Laptops: 7 },
          },
          hitsSample: [
            { objectID: '1', name: 'Product 1' },
            { objectID: '2', name: 'Product 2' },
          ],
          currentRefinements: [],
          maxSuggestions: 1,
        }),
        type: 'text',
      });
    });

    test('filters attributes when param used', async () => {
      const searchClient = createSearchClientWithHits();

      mockFetch();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          debounceMs: 0,
          agentId: 'test-agent-id',
          attributes: ['brand'],
        },
      });

      await act(async () => {
        await wait(10);
      });

      expect(getSentMessage()).toEqual({
        text: JSON.stringify({
          query: 'query',
          facets: {
            brand: { Apple: 10, Samsung: 5 },
          },
          hitsSample: [
            { objectID: '1', name: 'Product 1' },
            { objectID: '2', name: 'Product 2' },
          ],
          currentRefinements: [],
          maxSuggestions: 3,
        }),
        type: 'text',
      });
    });

    test('applies transformItems to suggestions', async () => {
      const searchClient = createSearchClientWithHits();

      mockFetch({
        parts: [
          { type: 'text', text: '' },
          {
            type: 'text',
            text: JSON.stringify([
              { attribute: 'brand', value: 'Apple', label: 'Brand', count: 10 },
            ]),
          },
        ],
      });

      const transformItems = jest.fn((items) => items);

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          agentId: 'test-agent-id',
          transformItems,
          debounceMs: 0,
        },
      });

      await act(async () => {
        await wait(10);
      });

      expect(transformItems).toHaveBeenCalledWith(
        [{ attribute: 'brand', value: 'Apple', label: 'Brand', count: 10 }],
        expect.objectContaining({
          results: expect.any(Object),
        })
      );
    });

    test('sends query and current refinements', async () => {
      const searchClient = createSearchClientWithHits();

      mockFetch();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          initialUiState: {
            indexName: {
              refinementList: { brand: ['Apple'] },
            },
          },
        },
        widgetParams: {
          debounceMs: 0,
          agentId: 'test-agent-id',
        },
      });

      await act(async () => {
        await wait(10);
      });

      expect(getSentMessage()).toEqual({
        text: JSON.stringify({
          query: 'query',
          facets: {
            brand: { Apple: 10, Samsung: 5 },
            category: { Phones: 8, Laptops: 7 },
          },
          hitsSample: [
            { objectID: '1', name: 'Product 1' },
            { objectID: '2', name: 'Product 2' },
          ],
          currentRefinements: [{ attribute: 'brand', value: 'Apple' }],
          maxSuggestions: 3,
        }),
        type: 'text',
      });
    });

    test('refining calls search', async () => {
      const searchClient = createSearchClientWithHits();

      mockFetch({
        parts: [
          { type: 'text', text: '' },
          {
            type: 'text',
            text: JSON.stringify([
              {
                attribute: 'brand',
                value: 'Samsung',
                label: 'Samsung',
                count: 10,
              },
            ]),
          },
        ],
      });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          agentId: 'test-agent-id',
          debounceMs: 0,
        },
      });

      await act(async () => {
        await wait(10);
      });

      await act(async () => {
        userEvent.click(
          screen.getByRole('button', {
            name: /samsung \(10\)/i,
          })
        );
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            indexName: 'indexName',
            params: expect.objectContaining({
              facetFilters: [['brand:Samsung']],
            }),
          }),
        ])
      );
    });
  });
}

function createSearchClientWithHits() {
  return createSearchClient({
    search: jest.fn(() =>
      Promise.resolve({
        results: [
          {
            query: 'query',
            hits: [
              { objectID: '1', name: 'Product 1' },
              { objectID: '2', name: 'Product 2' },
            ],
            facets: {
              brand: { Apple: 10, Samsung: 5 },
              category: { Phones: 8, Laptops: 7 },
            },
          },
        ],
      })
    ) as any,
  });
}

function mockFetch(response?: any) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve(
          response || {
            parts: [{ type: 'start' }, { type: 'text', text: '' }],
          }
        ),
    })
  ) as jest.Mock;
}

function getSentMessage() {
  return JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
    .messages[0].parts[0];
}
