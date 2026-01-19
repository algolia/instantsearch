import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';

import type { RefinementSuggestionsWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { SearchResponse } from 'instantsearch.js';

export function createOptionsTests(
  setup: RefinementSuggestionsWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('throws without agentId', () => {
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

    test('renders with default props', async () => {
      const searchClient = createSearchClient({
        search: jest.fn(() =>
          Promise.resolve({
            results: [
              {
                hits: [
                  { objectID: '1', name: 'Product 1' },
                  { objectID: '2', name: 'Product 2' },
                ],
                nbHits: 2,
                page: 0,
                nbPages: 1,
                hitsPerPage: 20,
                processingTimeMS: 1,
                query: '',
                params: '',
                index: 'indexName',
              },
            ],
          })
        ) as any,
      });

      // Mock fetch for the agent API
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              parts: [
                { type: 'text', text: '' },
                {
                  type: 'text',
                  text: JSON.stringify([
                    {
                      attribute: 'brand',
                      value: 'Apple',
                      label: 'Brand',
                      count: 10,
                    },
                    {
                      attribute: 'category',
                      value: 'Phone',
                      label: 'Category',
                      count: 5,
                    },
                  ]),
                },
              ],
            }),
        } as Response)
      ) as jest.Mock;

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: { agentId: 'test-agent-id', debounceMs: 0 },
          react: { agentId: 'test-agent-id', debounceMs: 0 },
          vue: {},
        },
      });

      await act(async () => {
        await wait(10);
      });

      expect(
        document.querySelector('.ais-RefinementSuggestions')
      ).toBeInTheDocument();
      expect(
        document.querySelector('.ais-RefinementSuggestions-header')
      ).toBeInTheDocument();
      expect(
        document.querySelector('.ais-RefinementSuggestions-list')
      ).toBeInTheDocument();

      const items = document.querySelectorAll(
        '.ais-RefinementSuggestions-item'
      );
      expect(items.length).toBe(2);
    });

    test('renders empty state when no hits', async () => {
      const searchClient = createSearchClient({
        search: jest.fn(() =>
          Promise.resolve({
            results: [
              {
                hits: [],
                nbHits: 0,
                page: 0,
                nbPages: 0,
                hitsPerPage: 20,
                processingTimeMS: 1,
                query: '',
                params: '',
              },
            ] as unknown as Array<SearchResponse<any>>,
          })
        ),
      });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: { agentId: 'test-agent-id' },
          react: { agentId: 'test-agent-id' },
          vue: {},
        },
      });

      await act(async () => {
        await wait(10);
      });

      // Should render but be empty since no hits means no suggestions
      const widget = document.querySelector('.ais-RefinementSuggestions');
      expect(widget).toBeEmptyDOMElement();
    });

    test('filters suggestions by attributes', async () => {
      const searchClient = createSearchClient({
        search: jest.fn(() =>
          Promise.resolve({
            results: [
              {
                hits: [
                  { objectID: '1', name: 'Product 1' },
                  { objectID: '2', name: 'Product 2' },
                ],
                nbHits: 2,
                page: 0,
                nbPages: 1,
                hitsPerPage: 20,
                processingTimeMS: 1,
                query: '',
                params: '',
                index: 'indexName',
              },
            ],
          })
        ) as any,
      });

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              parts: [
                { type: 'text', text: '' },
                {
                  type: 'text',
                  text: JSON.stringify([
                    {
                      attribute: 'brand',
                      value: 'Apple',
                      label: 'Brand',
                      count: 10,
                    },
                    {
                      attribute: 'color',
                      value: 'Red',
                      label: 'Color',
                      count: 3,
                    },
                  ]),
                },
              ],
            }),
        } as Response)
      ) as jest.Mock;

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          initialUiState: { indexName: { query: 'iphone' } },
        },
        widgetParams: {
          javascript: {
            agentId: 'test-agent-id',
            attributes: ['brand'],
            debounceMs: 0,
          },
          react: {
            agentId: 'test-agent-id',
            attributes: ['brand'],
            debounceMs: 0,
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(10);
      });

      const items = document.querySelectorAll(
        '.ais-RefinementSuggestions-item'
      );
      // Should only show brand suggestion (color filtered out)
      expect(items.length).toBe(1);
    });

    test('applies transformItems', async () => {
      const searchClient = createSearchClient({
        search: jest.fn(() =>
          Promise.resolve({
            results: [
              {
                hits: [
                  { objectID: '1', name: 'Product 1' },
                  { objectID: '2', name: 'Product 2' },
                ],
                nbHits: 2,
                page: 0,
                nbPages: 1,
                hitsPerPage: 20,
                processingTimeMS: 1,
                query: '',
                params: '',
                index: 'indexName',
              },
            ],
          })
        ) as any,
      });

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              parts: [
                { type: 'text', text: '' },
                {
                  type: 'text',
                  text: JSON.stringify([
                    {
                      attribute: 'brand',
                      value: 'Apple',
                      label: 'Brand',
                      count: 10,
                    },
                  ]),
                },
              ],
            }),
        } as Response)
      ) as jest.Mock;

      const transformItems = jest.fn((items: any[]) =>
        items.map((item: any) => ({ ...item, label: `Custom ${item.label}` }))
      );

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          javascript: {
            agentId: 'test-agent-id',
            transformItems,
            debounceMs: 0,
          },
          react: {
            agentId: 'test-agent-id',
            transformItems,
            debounceMs: 0,
          },
          vue: {},
        },
      });

      await act(async () => {
        await wait(10);
      });

      expect(transformItems).toHaveBeenCalled();
      // Check that transformed label is in the DOM
      expect(document.body.textContent).toContain('Custom Brand: Apple');
    });
  });
}
