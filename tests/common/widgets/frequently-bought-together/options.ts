import {
  createRecommendResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { normalizeSnapshot } from '@instantsearch/testutils';
import { wait } from '@testing-library/user-event/dist/utils';

import type { FrequentlyBoughtTogetherWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptionsTests(
  setup: FrequentlyBoughtTogetherWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with default props', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          objectIDs: ['objectID'],
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-FrequentlyBoughtTogether')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <section
          class="ais-FrequentlyBoughtTogether"
        >
          <h3
            class="ais-FrequentlyBoughtTogether-title"
          >
            Frequently bought together
          </h3>
          <div
            class="ais-FrequentlyBoughtTogether-container"
          >
            <ol
              class="ais-FrequentlyBoughtTogether-list"
            >
              <li
                class="ais-FrequentlyBoughtTogether-item"
              >
                {
          "_highlightResult": {
            "brand": {
              "matchLevel": "none",
              "matchedWords": [],
              "value": "Moschino Love"
            },
            "name": {
              "matchLevel": "none",
              "matchedWords": [],
              "value": "Moschino Love – Shoulder bag"
            }
          },
          "_score": 40.87,
          "brand": "Moschino Love",
          "list_categories": [
            "Women",
            "Bags",
            "Shoulder bags"
          ],
          "name": "Moschino Love – Shoulder bag",
          "objectID": "A0E200000002BLK",
          "parentID": "JC4052PP10LB100A",
          "price": {
            "currency": "EUR",
            "discount_level": -100,
            "discounted_value": 0,
            "on_sales": false,
            "value": 227.5
          }
        }
              </li>
              <li
                class="ais-FrequentlyBoughtTogether-item"
              >
                {
          "_highlightResult": {
            "brand": {
              "matchLevel": "none",
              "matchedWords": [],
              "value": "Gabs"
            },
            "name": {
              "matchLevel": "none",
              "matchedWords": [],
              "value": "Bag “Sabrina“ medium Gabs"
            }
          },
          "_score": 40.91,
          "brand": "Gabs",
          "list_categories": [
            "Women",
            "Bags",
            "Shoulder bags"
          ],
          "name": "Bag “Sabrina“ medium Gabs",
          "objectID": "A0E200000001WFI",
          "parentID": "SABRINA",
          "price": {
            "currency": "EUR",
            "discount_level": -100,
            "discounted_value": 0,
            "on_sales": false,
            "value": 210
          }
        }
              </li>
              <li
                class="ais-FrequentlyBoughtTogether-item"
              >
                {
          "_highlightResult": {
            "brand": {
              "matchLevel": "none",
              "matchedWords": [],
              "value": "La Carrie Bag"
            },
            "name": {
              "matchLevel": "none",
              "matchedWords": [],
              "value": "Bag La Carrie Bag small black"
            }
          },
          "_score": 39.92,
          "brand": "La Carrie Bag",
          "list_categories": [
            "Women",
            "Bags",
            "Shoulder bags"
          ],
          "name": "Bag La Carrie Bag small black",
          "objectID": "A0E2000000024R1",
          "parentID": "151",
          "price": {
            "currency": "EUR",
            "discount_level": -100,
            "discounted_value": 0,
            "on_sales": false,
            "value": 161.25
          }
        }
              </li>
            </ol>
          </div>
        </section>
      `
      );
    });

    test('renders transformed items', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          objectIDs: ['objectID'],
          transformItems(items) {
            return items.map((item) => ({
              objectID: item.objectID,
              __position: item.__position,
            }));
          },
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-FrequentlyBoughtTogether')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <section
          class="ais-FrequentlyBoughtTogether"
        >
          <h3
            class="ais-FrequentlyBoughtTogether-title"
          >
            Frequently bought together
          </h3>
          <div
            class="ais-FrequentlyBoughtTogether-container"
          >
            <ol
              class="ais-FrequentlyBoughtTogether-list"
            >
              <li
                class="ais-FrequentlyBoughtTogether-item"
              >
                {
          "objectID": "A0E200000002BLK"
        }
              </li>
              <li
                class="ais-FrequentlyBoughtTogether-item"
              >
                {
          "objectID": "A0E200000001WFI"
        }
              </li>
              <li
                class="ais-FrequentlyBoughtTogether-item"
              >
                {
          "objectID": "A0E2000000024R1"
        }
              </li>
            </ol>
          </div>
        </section>
      `
      );
    });

    describe('components', () => {
      test('renders with an empty component if provided', async () => {
        const searchClient = createMockedSearchClient();

        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            objectIDs: ['objectID'],
            // Using this to mock an empty response
            maxRecommendations: 0,
            templates: {
              empty: '',
            },
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(document.body).toMatchNormalizedInlineSnapshot(
          normalizeSnapshot,
          `
          <div>
            <section>
              No results
            </section>
          </div>
        `
        );
      });

      test('renders with a header component if provided', async () => {
        const searchClient = createMockedSearchClient();

        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            objectIDs: ['objectID'],
            templates: {
              header: '',
            },
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          document.querySelector('.ais-FrequentlyBoughtTogether-title')
        ).not.toBeNull();
        expect(
          document.querySelector('.ais-FrequentlyBoughtTogether-title')
        ).toMatchNormalizedInlineSnapshot(
          normalizeSnapshot,
          `
          <h3
            class="ais-FrequentlyBoughtTogether-title"
          >
            Frequently bought together
          </h3>
        `
        );
      });

      test('renders with a custom item component if provided', async () => {
        const searchClient = createMockedSearchClient();

        await setup({
          instantSearchOptions: {
            indexName: 'indexName',
            searchClient,
          },
          widgetParams: {
            objectIDs: ['objectID'],
            templates: {
              item: '',
            },
          },
        });

        await act(async () => {
          await wait(0);
        });

        expect(
          Array.from(
            document.querySelectorAll('.ais-FrequentlyBoughtTogether-item')
          ).map((item) => item.textContent)
        ).toEqual(['A0E200000002BLK', 'A0E200000001WFI', 'A0E2000000024R1']);
      });
    });
  });
}

function createMockedSearchClient() {
  return createSearchClient({
    getRecommendations: jest.fn((requests) =>
      Promise.resolve(
        createRecommendResponse(
          // @ts-ignore
          // `request` will be implicitly typed as any in type-check:v3
          // since `getRecommendations` is not available there
          requests.map((request) => {
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
