import {
  createAlgoliaSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { within, screen } from '@testing-library/dom';

import type { DynamicWidgetsWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptionsTests(
  setup: DynamicWidgetsWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    it('renders with default options', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          searchClient,
          indexName: 'indexName',
          initialUiState: {
            indexName: {},
          },
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      const dynamicWidgets = Array.from(
        document.querySelector('.ais-DynamicWidgets')!.childNodes
        // Vue 3 outputs comment nodes
      ).filter((node) => node.nodeType === Node.ELEMENT_NODE);

      expect(dynamicWidgets).toHaveLength(3);

      expect(
        within(dynamicWidgets[0] as HTMLElement).getByRole('link', {
          name: /tv/i,
        })
      ).toBeInTheDocument();

      expect(
        within(dynamicWidgets[1] as HTMLElement).getByRole('checkbox', {
          name: /samsung/i,
        })
      ).toBeInTheDocument();

      expect(
        within(dynamicWidgets[2] as HTMLElement).getByRole('link', {
          name: /books/i,
        })
      ).toBeInTheDocument();
    });

    it('forwards the `maxValuesPerFacet` option', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          searchClient,
          indexName: 'indexName',
          initialUiState: {
            indexName: {},
          },
        },
        widgetParams: { maxValuesPerFacet: 25 },
      });

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              maxValuesPerFacet: 25,
            }),
          }),
        ])
      );
    });

    it('forwards the `facets` option', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          searchClient,
          indexName: 'indexName',
          initialUiState: {
            indexName: {},
          },
        },
        widgetParams: { facets: ['other'] },
      });

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.search).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              facets: expect.arrayContaining(['other']),
            }),
          }),
        ])
      );
    });

    it('transforms items by calling the `transformItem` option', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          searchClient,
          indexName: 'indexName',
          initialUiState: {
            indexName: {},
          },
        },
        widgetParams: {
          transformItems: () => ['brand'],
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        screen.queryByRole('checkbox', { name: /samsung/i })
      ).toBeInTheDocument();

      expect(
        screen.queryByRole('link', { name: /tv/i })
      ).not.toBeInTheDocument();
    });
  });
}

function createMockedSearchClient() {
  return createAlgoliaSearchClient({
    search: jest.fn((requests) => {
      return Promise.resolve(
        createMultiSearchResponse(
          ...requests.map(() => {
            return createSingleSearchResponse({
              facets: {
                brand: {
                  Samsung: 633,
                  Metra: 591,
                },
                category: {
                  TV: 633,
                  Radio: 591,
                },
                'hierarchicalCategories.lvl0': {
                  Electronics: 633,
                  Books: 591,
                },
              },
              renderingContent: {
                facetOrdering: {
                  facets: {
                    order: ['category', 'brand', 'hierarchicalCategories.lvl0'],
                  },
                },
              },
            });
          })
        )
      );
    }),
  });
}
