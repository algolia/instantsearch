import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';

import { skippableDescribe } from '../../common';

import type { LookingSimilarConnectorSetup } from '.';
import type { SetupOptions, TestOptions } from '../../common';
import type { SearchClient } from 'instantsearch.js';

export function createOptionsTests(
  setup: LookingSimilarConnectorSetup,
  { act, skippedTests }: Required<TestOptions>
) {
  skippableDescribe('options', skippedTests, () => {
    test('throws when not passing the `objectIDs` option', async () => {
      const options: SetupOptions<LookingSimilarConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient(),
        },
        // @ts-expect-error missing `objectIDs`
        widgetParams: {},
      };

      await expect(async () => {
        await setup(options);
      }).rejects.toThrowErrorMatchingInlineSnapshot(`
              "The \`objectIDs\` option is required.

              See documentation: https://www.algolia.com/doc/api-reference/widgets/looking-similar/js/#connector"
            `);
    });

    test('forwards parameters to the client', async () => {
      const searchClient = createMockedSearchClient();
      const options: SetupOptions<LookingSimilarConnectorSetup> = {
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          objectIDs: ['1', '2'],
          maxRecommendations: 2,
          threshold: 3,
          fallbackParameters: { facetFilters: ['test1'] },
          queryParameters: { analytics: true },
        },
      };

      await setup(options);

      expect(searchClient.getRecommendations).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            objectID: '1',
            maxRecommendations: 2,
            threshold: 3,
            fallbackParameters: { facetFilters: ['test1'] },
            queryParameters: { analytics: true },
            model: 'looking-similar',
            indexName: 'indexName',
          }),
          expect.objectContaining({
            objectID: '2',
            maxRecommendations: 2,
            threshold: 3,
            fallbackParameters: { facetFilters: ['test1'] },
            queryParameters: { analytics: true },
            model: 'looking-similar',
            indexName: 'indexName',
          }),
        ])
      );
    });

    test('returns recommendations', async () => {
      const options: SetupOptions<LookingSimilarConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createMockedSearchClient(),
        },
        widgetParams: { objectIDs: ['1'] },
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
      const options: SetupOptions<LookingSimilarConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createMockedSearchClient(),
        },
        widgetParams: {
          objectIDs: ['1'],
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
          // @ts-ignore
          // `request` will be implicitly typed as `any` in type-check:v3
          // since `getRecommendations` is not available there
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
    ) as SearchClient['getRecommendations'],
  });
}
