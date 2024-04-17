/**
 * @jest-environment jsdom
 */
/** @jsx h */
import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { Fragment, h } from 'preact';

import instantsearch from '../../../index.es';
import frequentlyBoughtTogether from '../frequently-bought-together';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('frequentlyBoughtTogether', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createSearchClient();

        const search = instantsearch({
          indexName: 'indexName',
          searchClient,
        });

        search.addWidgets([
          frequentlyBoughtTogether({
            // @ts-expect-error
            container: undefined,
          }),
        ]);
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/frequentlyBoughtTogether/js/"
      `);
    });

    test('adds custom CSS classes', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });

      search.addWidgets([
        frequentlyBoughtTogether({
          container,
          objectID: 'objectID',
          cssClasses: {
            root: 'ROOT',
            title: 'TITLE',
            container: 'CONTAINER',
            list: 'LIST',
            item: 'ITEM',
          },
          templates: {
            header: 'Frequently bought together',
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(
        container.querySelector('.ais-FrequentlyBoughtTogether')
      ).toHaveClass('ROOT');
      expect(
        container.querySelector('.ais-FrequentlyBoughtTogether-title')
      ).toHaveClass('TITLE');
      expect(
        container.querySelector('.ais-FrequentlyBoughtTogether-container')
      ).toHaveClass('CONTAINER');
      expect(
        container.querySelector('.ais-FrequentlyBoughtTogether-list')
      ).toHaveClass('LIST');
      expect(
        container.querySelector('.ais-FrequentlyBoughtTogether-item')
      ).toHaveClass('ITEM');
    });
  });

  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const containerNoResults = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        frequentlyBoughtTogether({
          container,
          objectID: 'objectID',
        }),
        frequentlyBoughtTogether({
          container: containerNoResults,
          objectID: 'objectID2',
          // Using this to mock an empty response
          maxRecommendations: 0,
        }),
      ]);

      // @MAJOR Once Hogan.js and string-based templates are removed,
      // `search.start()` can be moved to the test body and the following
      // assertion can go away.
      expect(async () => {
        search.start();
        await wait(0);
      }).not.toWarnDev();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <section
            class="ais-FrequentlyBoughtTogether"
          >
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
        </div>
      `);

      expect(containerNoResults).toMatchInlineSnapshot(`
        <div>
          <section>
            No results
          </section>
        </div>
      `);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const containerNoResults = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        frequentlyBoughtTogether({
          container,
          objectID: 'objectID',
          templates: {
            header({ translations }, { html }) {
              return html`${translations.title}`;
            },
            item(hit, { html }) {
              return html`<h2>${hit.name}</h2>
                <p>${hit.brand}</p>`;
            },
          },
        }),
        frequentlyBoughtTogether({
          container: containerNoResults,
          objectID: 'objectID3',
          // Using this to mock an empty response
          maxRecommendations: 0,
          templates: {
            empty(_, { html }) {
              return html`<p>No results</p>`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
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
                  <h2>
                    Moschino Love – Shoulder bag
                  </h2>
                  <p>
                    Moschino Love
                  </p>
                </li>
                <li
                  class="ais-FrequentlyBoughtTogether-item"
                >
                  <h2>
                    Bag “Sabrina“ medium Gabs
                  </h2>
                  <p>
                    Gabs
                  </p>
                </li>
                <li
                  class="ais-FrequentlyBoughtTogether-item"
                >
                  <h2>
                    Bag La Carrie Bag small black
                  </h2>
                  <p>
                    La Carrie Bag
                  </p>
                </li>
              </ol>
            </div>
          </section>
        </div>
      `);

      expect(containerNoResults).toMatchInlineSnapshot(`
        <div>
          <section>
            <p>
              No results
            </p>
          </section>
        </div>
      `);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const containerNoResults = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        frequentlyBoughtTogether({
          container,
          objectID: 'objectID',
          templates: {
            header({ translations }) {
              return <Fragment>{translations.title}</Fragment>;
            },
            item(hit) {
              return (
                <Fragment>
                  <h2>${hit.name}</h2>
                  <p>${hit.brand}</p>
                </Fragment>
              );
            },
          },
        }),
        frequentlyBoughtTogether({
          container: containerNoResults,
          objectID: 'objectID3',
          // Using this to mock an empty response
          maxRecommendations: 0,
          templates: {
            empty() {
              return <p>No results</p>;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
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
                  <h2>
                    $
                    Moschino Love – Shoulder bag
                  </h2>
                  <p>
                    $
                    Moschino Love
                  </p>
                </li>
                <li
                  class="ais-FrequentlyBoughtTogether-item"
                >
                  <h2>
                    $
                    Bag “Sabrina“ medium Gabs
                  </h2>
                  <p>
                    $
                    Gabs
                  </p>
                </li>
                <li
                  class="ais-FrequentlyBoughtTogether-item"
                >
                  <h2>
                    $
                    Bag La Carrie Bag small black
                  </h2>
                  <p>
                    $
                    La Carrie Bag
                  </p>
                </li>
              </ol>
            </div>
          </section>
        </div>
      `);

      expect(containerNoResults).toMatchInlineSnapshot(`
        <div>
          <section>
            <p>
              No results
            </p>
          </section>
        </div>
      `);
    });
  });

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
});
