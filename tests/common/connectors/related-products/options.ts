import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';

import type { RelatedProductsConnectorSetup } from '.';
import type { SetupOptions, TestOptions } from '../../common';

export function createOptionsTests(
  setup: RelatedProductsConnectorSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('throws when not passing the `objectID` option', async () => {
      const options: SetupOptions<RelatedProductsConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        widgetParams: {},
      };

      await expect(async () => {
        await setup(options);
      }).rejects.toThrowErrorMatchingInlineSnapshot(`
              "The \`objectID\` option is required.

              See documentation: https://www.algolia.com/doc/api-reference/widgets/related-products/js/#connector"
            `);
    });

    test('forwards parameters to the client', async () => {
      const searchClient = createMockedSearchClient();
      const options: SetupOptions<RelatedProductsConnectorSetup> = {
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          objectID: '1',
          maxRecommendations: 2,
          threshold: 3,
          fallbackParameters: { facetFilters: ['test1'] },
          queryParameters: { analytics: true },
        },
      };

      await setup(options);

      expect(searchClient.getRecommendations).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining(options.widgetParams)])
      );
    });

    test('returns recommendations', async () => {
      const options: SetupOptions<RelatedProductsConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createMockedSearchClient(),
        },
        widgetParams: { objectID: '1' },
      };

      await setup(options);

      expect(screen.getByRole('list')).toMatchInlineSnapshot(`<ul />`);

      await act(async () => {
        await wait(0);
      });

      expect(screen.getByRole('list')).toMatchInlineSnapshot(`
        <ul>
          <li>
            A0E200000002BLK
          </li>
          <li>
            A0E200000001WFI
          </li>
          <li>
            A0E2000000024R1
          </li>
        </ul>
      `);
    });

    test('transforms recommendations', async () => {
      const options: SetupOptions<RelatedProductsConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createMockedSearchClient(),
        },
        widgetParams: {
          objectID: '1',
          transformItems(items) {
            return items.map((item) => ({
              ...item,
              objectID: item.objectID.toLowerCase(),
            }));
          },
        },
      };

      await setup(options);

      expect(screen.getByRole('list')).toMatchInlineSnapshot(`<ul />`);

      await act(async () => {
        await wait(0);
      });

      expect(screen.getByRole('list')).toMatchInlineSnapshot(`
        <ul>
          <li>
            a0e200000002blk
          </li>
          <li>
            a0e200000001wfi
          </li>
          <li>
            a0e2000000024r1
          </li>
        </ul>
      `);
    });
  });
}

function createMockedSearchClient() {
  return createSearchClient({
    getRecommendations: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          ...requests.map((request) => {
            return createSingleSearchResponse<any>({
              hits:
                request.maxRecommendations === 0
                  ? []
                  : [
                      {
                        _highlightResult: {
                          brand: {
                            matchLevel: 'none',
                            matchedWords: [],
                            value: 'Moschino Love',
                          },
                          name: {
                            matchLevel: 'none',
                            matchedWords: [],
                            value: 'Moschino Love – Shoulder bag',
                          },
                        },
                        _score: 40.87,
                        brand: 'Moschino Love',
                        list_categories: ['Women', 'Bags', 'Shoulder bags'],
                        name: 'Moschino Love – Shoulder bag',
                        objectID: 'A0E200000002BLK',
                        parentID: 'JC4052PP10LB100A',
                        price: {
                          currency: 'EUR',
                          discount_level: -100,
                          discounted_value: 0,
                          on_sales: false,
                          value: 227.5,
                        },
                      },
                      {
                        _highlightResult: {
                          brand: {
                            matchLevel: 'none',
                            matchedWords: [],
                            value: 'Gabs',
                          },
                          name: {
                            matchLevel: 'none',
                            matchedWords: [],
                            value: 'Bag “Sabrina“ medium Gabs',
                          },
                        },
                        _score: 40.91,
                        brand: 'Gabs',
                        list_categories: ['Women', 'Bags', 'Shoulder bags'],
                        name: 'Bag “Sabrina“ medium Gabs',
                        objectID: 'A0E200000001WFI',
                        parentID: 'SABRINA',
                        price: {
                          currency: 'EUR',
                          discount_level: -100,
                          discounted_value: 0,
                          on_sales: false,
                          value: 210,
                        },
                      },
                      {
                        _highlightResult: {
                          brand: {
                            matchLevel: 'none',
                            matchedWords: [],
                            value: 'La Carrie Bag',
                          },
                          name: {
                            matchLevel: 'none',
                            matchedWords: [],
                            value: 'Bag La Carrie Bag small black',
                          },
                        },
                        _score: 39.92,
                        brand: 'La Carrie Bag',
                        list_categories: ['Women', 'Bags', 'Shoulder bags'],
                        name: 'Bag La Carrie Bag small black',
                        objectID: 'A0E2000000024R1',
                        parentID: '151',
                        price: {
                          currency: 'EUR',
                          discount_level: -100,
                          discounted_value: 0,
                          on_sales: false,
                          value: 161.25,
                        },
                      },
                    ],
            });
          })
        )
      )
    ),
  });
}
