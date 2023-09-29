/**
 * @jest-environment jsdom
 */
/** @jsx h */
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { within, fireEvent, getByText } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { Fragment, h } from 'preact';

import instantsearch from '../../../index.es';
import { createInsightsMiddleware } from '../../../middlewares';
import configure from '../../configure/configure';
import searchBox from '../../search-box/search-box';
import hits from '../hits';

import type { SearchResponse } from '../../../../src/types';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('hits', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createSearchClient();

        const search = instantsearch({
          indexName: 'indexName',
          searchClient,
        });

        search.addWidgets([
          hits({
            // @ts-expect-error
            container: undefined,
          }),
        ]);
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hits/js/"
`);
    });

    test('adds custom CSS classes', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        initialUiState: {
          indexName: {
            refinementList: {
              brand: ['Apple', 'Samsung'],
              categories: ['Audio'],
            },
          },
        },
      });

      search.addWidgets([
        hits({
          container,
          cssClasses: {
            root: 'ROOT',
            emptyRoot: 'EMPTY_ROOT',
            list: 'LIST',
            item: 'ITEM',
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container.querySelector('.ais-Hits')).toHaveClass('ROOT');
      expect(container.querySelector('.ais-Hits-list')).toHaveClass('LIST');
      expect(container.querySelector('.ais-Hits-item')).toHaveClass('ITEM');
    });

    type CustomHit = { name: string; description: string };

    function createMockedSearchClient(
      subset: Partial<SearchResponse<CustomHit>> = {}
    ) {
      return createSearchClient({
        search: jest.fn((requests) => {
          return Promise.resolve(
            createMultiSearchResponse(
              ...requests.map((request) => {
                return createSingleSearchResponse<any>({
                  index: request.indexName,
                  query: request.params?.query,
                  hits:
                    request.params?.query === 'query with no results'
                      ? []
                      : [
                          {
                            objectID: '1',
                            name: 'Apple iPhone smartphone',
                            description: 'A smartphone by Apple.',
                            _highlightResult: {
                              name: {
                                value: `Apple iPhone <mark>smartphone</mark>`,
                                matchLevel: 'full' as const,
                                matchedWords: ['smartphone'],
                              },
                            },
                            _snippetResult: {
                              name: {
                                value: `Apple iPhone <mark>smartphone</mark>`,
                                matchLevel: 'full' as const,
                              },
                              description: {
                                value: `A <mark>smartphone</mark> by Apple.`,
                                matchLevel: 'full' as const,
                              },
                            },
                          },
                          {
                            objectID: '2',
                            name: 'Samsung Galaxy smartphone',
                            description: 'A smartphone by Samsung.',
                            _highlightResult: {
                              name: {
                                value: `Samsung Galaxy <mark>smartphone</mark>`,
                                matchLevel: 'full' as const,
                                matchedWords: ['smartphone'],
                              },
                            },
                            _snippetResult: {
                              name: {
                                value: `Samsung Galaxy <mark>smartphone</mark>`,
                                matchLevel: 'full' as const,
                              },
                              description: {
                                value: `A <mark>smartphone</mark> by Samsung.`,
                                matchLevel: 'full' as const,
                              },
                            },
                          },
                        ],
                  ...subset,
                });
              })
            )
          );
        }),
      });
    }
  });

  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchBoxContainer = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        searchBox({ container: searchBoxContainer }),
        hits({ container }),
      ]);

      // @MAJOR Once Hogan.js and string-based templates are removed,
      // `search.start()` can be moved to the test body and the following
      // assertion can go away.
      expect(async () => {
        search.start();
        // prevent warning from insights view event because insightsClient isn't yet loaded
        // @ts-ignore
        search.helper!.state.userToken = 'userToken';

        await wait(0);
      }).not.toWarnDev();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-Hits"
          >
            <ol
              class="ais-Hits-list"
            >
              <li
                class="ais-Hits-item"
              >
                {
          "objectID": "1",
          "name": "Apple iPhone smartphone",
          "description": "A smartphone by Apple.",
          "_highlightResult": {
            "name": {
              "value": "Apple iPhone &lt;mark&gt;smartphone&lt;/mark&gt;",
              "matchLevel": "full",
              "matchedWords": [
                "smartphone"
              ]
            }
          },
          "_snippetResult": {
            "name": {
              "value": "Apple iPhone &lt;mark&gt;smartphone&lt;/mark&gt;",
              "matchLevel": "full"
            },
            "description": {
              "value": "A &lt;mark&gt;smartphone&lt;/mark&gt; by Apple.",
              "matchLevel": "full"
            }
          },
          "__position": 1
        }
              </li>
              <li
                class="ais-Hits-item"
              >
                {
          "objectID": "2",
          "name": "Samsung Galaxy smartphone",
          "description": "A smartphone by Samsung.",
          "_highlightResult": {
            "name": {
              "value": "Samsung Galaxy &lt;mark&gt;smartphone&lt;/mark&gt;",
              "matchLevel": "full",
              "matchedWords": [
                "smartphone"
              ]
            }
          },
          "_snippetResult": {
            "name": {
              "value": "Samsung Galaxy &lt;mark&gt;smartphone&lt;/mark&gt;",
              "matchLevel": "full"
            },
            "description": {
              "value": "A &lt;mark&gt;smartphone&lt;/mark&gt; by Samsung.",
              "matchLevel": "full"
            }
          },
          "__position": 2
        }
              </li>
            </ol>
          </div>
        </div>
      `);

      fireEvent.input(within(searchBoxContainer).getByRole('searchbox'), {
        target: { value: 'query with no results' },
      });

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-Hits ais-Hits--empty"
          >
            No results
          </div>
        </div>
      `);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchBoxContainer = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        searchBox({ container: searchBoxContainer }),
        hits({
          container,
          templates: {
            item(hit, { html, components }) {
              return html`
                <h2>${components.Highlight({ hit, attribute: 'name' })}</h2>
                <h3>
                  ${components.ReverseHighlight({ hit, attribute: 'name' })}
                </h3>
                <p>${components.Snippet({ hit, attribute: 'description' })}</p>
                <p>
                  ${components.ReverseSnippet({
                    hit,
                    attribute: 'description',
                  })}
                </p>
              `;
            },
            empty({ query }, { html }) {
              return html`<p>No results for <q>${query}</q></p>`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-Hits"
          >
            <ol
              class="ais-Hits-list"
            >
              <li
                class="ais-Hits-item"
              >
                <h2>
                  <span
                    class="ais-Highlight"
                  >
                    <span
                      class="ais-Highlight-nonHighlighted"
                    >
                      Apple iPhone 
                    </span>
                    <mark
                      class="ais-Highlight-highlighted"
                    >
                      smartphone
                    </mark>
                  </span>
                </h2>
                <h3>
                  <span
                    class="ais-ReverseHighlight"
                  >
                    <mark
                      class="ais-ReverseHighlight-highlighted"
                    >
                      Apple iPhone 
                    </mark>
                    <span
                      class="ais-ReverseHighlight-nonHighlighted"
                    >
                      smartphone
                    </span>
                  </span>
                </h3>
                <p>
                  <span
                    class="ais-Snippet"
                  >
                    <span
                      class="ais-Snippet-nonHighlighted"
                    >
                      A 
                    </span>
                    <mark
                      class="ais-Snippet-highlighted"
                    >
                      smartphone
                    </mark>
                    <span
                      class="ais-Snippet-nonHighlighted"
                    >
                       by Apple.
                    </span>
                  </span>
                </p>
                <p>
                  <span
                    class="ais-ReverseSnippet"
                  >
                    <mark
                      class="ais-ReverseSnippet-highlighted"
                    >
                      A 
                    </mark>
                    <span
                      class="ais-ReverseSnippet-nonHighlighted"
                    >
                      smartphone
                    </span>
                    <mark
                      class="ais-ReverseSnippet-highlighted"
                    >
                       by Apple.
                    </mark>
                  </span>
                </p>
              </li>
              <li
                class="ais-Hits-item"
              >
                <h2>
                  <span
                    class="ais-Highlight"
                  >
                    <span
                      class="ais-Highlight-nonHighlighted"
                    >
                      Samsung Galaxy 
                    </span>
                    <mark
                      class="ais-Highlight-highlighted"
                    >
                      smartphone
                    </mark>
                  </span>
                </h2>
                <h3>
                  <span
                    class="ais-ReverseHighlight"
                  >
                    <mark
                      class="ais-ReverseHighlight-highlighted"
                    >
                      Samsung Galaxy 
                    </mark>
                    <span
                      class="ais-ReverseHighlight-nonHighlighted"
                    >
                      smartphone
                    </span>
                  </span>
                </h3>
                <p>
                  <span
                    class="ais-Snippet"
                  >
                    <span
                      class="ais-Snippet-nonHighlighted"
                    >
                      A 
                    </span>
                    <mark
                      class="ais-Snippet-highlighted"
                    >
                      smartphone
                    </mark>
                    <span
                      class="ais-Snippet-nonHighlighted"
                    >
                       by Samsung.
                    </span>
                  </span>
                </p>
                <p>
                  <span
                    class="ais-ReverseSnippet"
                  >
                    <mark
                      class="ais-ReverseSnippet-highlighted"
                    >
                      A 
                    </mark>
                    <span
                      class="ais-ReverseSnippet-nonHighlighted"
                    >
                      smartphone
                    </span>
                    <mark
                      class="ais-ReverseSnippet-highlighted"
                    >
                       by Samsung.
                    </mark>
                  </span>
                </p>
              </li>
            </ol>
          </div>
        </div>
      `);

      fireEvent.input(within(searchBoxContainer).getByRole('searchbox'), {
        target: { value: 'query with no results' },
      });

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-Hits ais-Hits--empty"
          >
            <p>
              No results for 
              <q>
                query with no results
              </q>
            </p>
          </div>
        </div>
      `);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchBoxContainer = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        searchBox({ container: searchBoxContainer }),
        hits({
          container,
          templates: {
            item(hit, { components }) {
              return (
                <Fragment>
                  <h2>
                    <components.Highlight hit={hit} attribute="name" />
                  </h2>
                  <h3>
                    <components.ReverseHighlight hit={hit} attribute="name" />
                  </h3>
                  <p>
                    <components.Snippet hit={hit} attribute="description" />
                  </p>
                  <p>
                    <components.ReverseSnippet
                      hit={hit}
                      attribute="description"
                    />
                  </p>
                </Fragment>
              );
            },
            empty({ query }) {
              return (
                <p>
                  No results for <q>{query}</q>
                </p>
              );
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-Hits"
          >
            <ol
              class="ais-Hits-list"
            >
              <li
                class="ais-Hits-item"
              >
                <h2>
                  <span
                    class="ais-Highlight"
                  >
                    <span
                      class="ais-Highlight-nonHighlighted"
                    >
                      Apple iPhone 
                    </span>
                    <mark
                      class="ais-Highlight-highlighted"
                    >
                      smartphone
                    </mark>
                  </span>
                </h2>
                <h3>
                  <span
                    class="ais-ReverseHighlight"
                  >
                    <mark
                      class="ais-ReverseHighlight-highlighted"
                    >
                      Apple iPhone 
                    </mark>
                    <span
                      class="ais-ReverseHighlight-nonHighlighted"
                    >
                      smartphone
                    </span>
                  </span>
                </h3>
                <p>
                  <span
                    class="ais-Snippet"
                  >
                    <span
                      class="ais-Snippet-nonHighlighted"
                    >
                      A 
                    </span>
                    <mark
                      class="ais-Snippet-highlighted"
                    >
                      smartphone
                    </mark>
                    <span
                      class="ais-Snippet-nonHighlighted"
                    >
                       by Apple.
                    </span>
                  </span>
                </p>
                <p>
                  <span
                    class="ais-ReverseSnippet"
                  >
                    <mark
                      class="ais-ReverseSnippet-highlighted"
                    >
                      A 
                    </mark>
                    <span
                      class="ais-ReverseSnippet-nonHighlighted"
                    >
                      smartphone
                    </span>
                    <mark
                      class="ais-ReverseSnippet-highlighted"
                    >
                       by Apple.
                    </mark>
                  </span>
                </p>
              </li>
              <li
                class="ais-Hits-item"
              >
                <h2>
                  <span
                    class="ais-Highlight"
                  >
                    <span
                      class="ais-Highlight-nonHighlighted"
                    >
                      Samsung Galaxy 
                    </span>
                    <mark
                      class="ais-Highlight-highlighted"
                    >
                      smartphone
                    </mark>
                  </span>
                </h2>
                <h3>
                  <span
                    class="ais-ReverseHighlight"
                  >
                    <mark
                      class="ais-ReverseHighlight-highlighted"
                    >
                      Samsung Galaxy 
                    </mark>
                    <span
                      class="ais-ReverseHighlight-nonHighlighted"
                    >
                      smartphone
                    </span>
                  </span>
                </h3>
                <p>
                  <span
                    class="ais-Snippet"
                  >
                    <span
                      class="ais-Snippet-nonHighlighted"
                    >
                      A 
                    </span>
                    <mark
                      class="ais-Snippet-highlighted"
                    >
                      smartphone
                    </mark>
                    <span
                      class="ais-Snippet-nonHighlighted"
                    >
                       by Samsung.
                    </span>
                  </span>
                </p>
                <p>
                  <span
                    class="ais-ReverseSnippet"
                  >
                    <mark
                      class="ais-ReverseSnippet-highlighted"
                    >
                      A 
                    </mark>
                    <span
                      class="ais-ReverseSnippet-nonHighlighted"
                    >
                      smartphone
                    </span>
                    <mark
                      class="ais-ReverseSnippet-highlighted"
                    >
                       by Samsung.
                    </mark>
                  </span>
                </p>
              </li>
            </ol>
          </div>
        </div>
      `);

      fireEvent.input(within(searchBoxContainer).getByRole('searchbox'), {
        target: { value: 'query with no results' },
      });

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-Hits ais-Hits--empty"
          >
            <p>
              No results for 
              <q>
                query with no results
              </q>
            </p>
          </div>
        </div>
      `);
    });

    type CustomHit = { name: string; description: string };

    function createMockedSearchClient(
      subset: Partial<SearchResponse<CustomHit>> = {}
    ) {
      return createSearchClient({
        search: jest.fn((requests) => {
          return Promise.resolve(
            createMultiSearchResponse(
              ...requests.map((request) => {
                return createSingleSearchResponse<any>({
                  index: request.indexName,
                  query: request.params?.query,
                  hits:
                    request.params?.query === 'query with no results'
                      ? []
                      : [
                          {
                            objectID: '1',
                            name: 'Apple iPhone smartphone',
                            description: 'A smartphone by Apple.',
                            _highlightResult: {
                              name: {
                                value: `Apple iPhone <mark>smartphone</mark>`,
                                matchLevel: 'full' as const,
                                matchedWords: ['smartphone'],
                              },
                            },
                            _snippetResult: {
                              name: {
                                value: `Apple iPhone <mark>smartphone</mark>`,
                                matchLevel: 'full' as const,
                              },
                              description: {
                                value: `A <mark>smartphone</mark> by Apple.`,
                                matchLevel: 'full' as const,
                              },
                            },
                          },
                          {
                            objectID: '2',
                            name: 'Samsung Galaxy smartphone',
                            description: 'A smartphone by Samsung.',
                            _highlightResult: {
                              name: {
                                value: `Samsung Galaxy <mark>smartphone</mark>`,
                                matchLevel: 'full' as const,
                                matchedWords: ['smartphone'],
                              },
                            },
                            _snippetResult: {
                              name: {
                                value: `Samsung Galaxy <mark>smartphone</mark>`,
                                matchLevel: 'full' as const,
                              },
                              description: {
                                value: `A <mark>smartphone</mark> by Samsung.`,
                                matchLevel: 'full' as const,
                              },
                            },
                          },
                        ],
                  ...subset,
                });
              })
            )
          );
        }),
      });
    }
  });

  describe('insights', () => {
    const createInsightsMiddlewareWithOnEvent = () => {
      const onEvent = jest.fn();

      const insights = createInsightsMiddleware({
        insightsClient: null,
        onEvent,
      });

      return { onEvent, insights };
    };

    test('sends view event when hits are rendered', async () => {
      const { insights, onEvent } = createInsightsMiddlewareWithOnEvent();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient: createMockedSearchClient(),
      });

      search.use(insights);
      search.addWidgets([hits({ container: document.createElement('div') })]);
      search.start();

      await wait(0);

      expect(onEvent).toHaveBeenCalledTimes(1);
      expect(onEvent).toHaveBeenCalledWith(
        {
          eventType: 'view',
          eventModifier: 'internal',
          hits: [
            {
              __position: 1,
              objectID: '1',
              name: 'Name 1',
            },
            {
              __position: 2,
              objectID: '2',
              name: 'Name 2',
            },
          ],
          insightsMethod: 'viewedObjectIDs',
          payload: {
            eventName: 'Hits Viewed',
            index: 'indexName',
            objectIDs: ['1', '2'],
          },
          widgetType: 'ais.hits',
        },
        expect.any(Function)
      );
    });

    test('sends a default `click` event when clicking on a hit', async () => {
      const container = document.createElement('div');
      const { insights, onEvent } = createInsightsMiddlewareWithOnEvent();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient: createMockedSearchClient(),
      });

      search.use(insights);
      search.addWidgets([hits({ container })]);
      search.start();

      await wait(0);

      onEvent.mockClear();

      userEvent.click(container.querySelectorAll('.ais-Hits-item')[0]);

      expect(onEvent).toHaveBeenCalledTimes(1);
      expect(onEvent).toHaveBeenCalledWith(
        {
          eventType: 'click',
          eventModifier: 'internal',
          hits: [
            {
              __position: 1,
              objectID: '1',
              name: 'Name 1',
            },
          ],
          insightsMethod: 'clickedObjectIDsAfterSearch',
          payload: {
            eventName: 'Hit Clicked',
            index: 'indexName',
            objectIDs: ['1'],
            positions: [1],
          },
          widgetType: 'ais.hits',
        },
        expect.any(Function)
      );
    });

    test('sends `click` event with `sendEvent`', async () => {
      const container = document.createElement('div');
      const { insights, onEvent } = createInsightsMiddlewareWithOnEvent();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient: createMockedSearchClient(),
      });

      search.use(insights);

      search.addWidgets([
        hits({
          container,
          templates: {
            item: (item, { html, sendEvent }) => html`
              <button
                type="button"
                onClick=${() => sendEvent('click', item, 'Item Clicked')}
              >
                ${item.name}
              </button>
            `,
          },
        }),
      ]);

      search.start();

      await wait(0);

      // view event by render
      expect(onEvent).toHaveBeenCalledTimes(1);
      onEvent.mockClear();

      fireEvent.click(getByText(container, 'Name 1'));

      // The custom one only
      expect(onEvent).toHaveBeenCalledTimes(1);
      expect(onEvent.mock.calls[0][0]).toEqual({
        eventType: 'click',
        hits: [
          {
            __hitIndex: 0,
            __position: 1,
            objectID: '1',
            name: 'Name 1',
          },
        ],
        insightsMethod: 'clickedObjectIDsAfterSearch',
        payload: {
          eventName: 'Item Clicked',
          index: 'indexName',
          objectIDs: ['1'],
          positions: [1],
        },
        widgetType: 'ais.hits',
      });
    });

    test('sends `conversion` event with `sendEvent`', async () => {
      const container = document.createElement('div');
      const { insights, onEvent } = createInsightsMiddlewareWithOnEvent();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient: createMockedSearchClient(),
      });

      search.use(insights);

      search.addWidgets([
        hits({
          container,
          templates: {
            item: (item, { html, sendEvent }) => html`
              <button
                type="button"
                onClick=${() =>
                  sendEvent('conversion', item, 'Product Ordered')}
              >
                ${item.name}
              </button>
            `,
          },
        }),
      ]);

      search.start();

      await wait(0);

      // view event by render
      expect(onEvent).toHaveBeenCalledTimes(1);
      onEvent.mockClear();

      fireEvent.click(getByText(container, 'Name 2'));
      // The custom one + default click
      expect(onEvent).toHaveBeenCalledTimes(2);
      expect(onEvent.mock.calls[0][0]).toEqual({
        eventType: 'conversion',
        hits: [
          {
            __hitIndex: 1,
            __position: 2,
            objectID: '2',
            name: 'Name 2',
          },
        ],
        insightsMethod: 'convertedObjectIDsAfterSearch',
        payload: {
          eventName: 'Product Ordered',
          index: 'indexName',
          objectIDs: ['2'],
        },
        widgetType: 'ais.hits',
      });
      expect(onEvent.mock.calls[1][0]).toEqual({
        eventType: 'click',
        eventModifier: 'internal',
        hits: [
          {
            __position: 2,
            objectID: '2',
            name: 'Name 2',
          },
        ],
        insightsMethod: 'clickedObjectIDsAfterSearch',
        payload: {
          eventName: 'Hit Clicked',
          index: 'indexName',
          objectIDs: ['2'],
          positions: [2],
        },
        widgetType: 'ais.hits',
      });
    });

    test('sends `click` event with `bindEvent`', async () => {
      const container = document.createElement('div');
      const { insights, onEvent } = createInsightsMiddlewareWithOnEvent();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient: createMockedSearchClient(),
      });

      search.use(insights);

      search.addWidgets([
        hits({
          container,
          templates: {
            item: (item, bindEvent) => `
              <button type='button' ${bindEvent('click', item, 'Item Clicked')}>
                ${item.name}
              </button>
            `,
          },
        }),
      ]);
      search.start();
      await wait(0);

      // view event by render
      expect(onEvent).toHaveBeenCalledTimes(1);
      onEvent.mockClear();

      fireEvent.click(getByText(container, 'Name 1'));
      // The custom one only
      expect(onEvent).toHaveBeenCalledTimes(1);
      expect(onEvent.mock.calls[0][0]).toEqual({
        eventType: 'click',
        hits: [
          {
            __hitIndex: 0,
            __position: 1,
            objectID: '1',
            name: 'Name 1',
          },
        ],
        insightsMethod: 'clickedObjectIDsAfterSearch',
        payload: {
          eventName: 'Item Clicked',
          index: 'indexName',
          objectIDs: ['1'],
          positions: [1],
        },
        widgetType: 'ais.hits',
      });
    });

    test('sends `conversion` event with `bindEvent`', async () => {
      const container = document.createElement('div');
      const { insights, onEvent } = createInsightsMiddlewareWithOnEvent();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient: createMockedSearchClient(),
      });

      search.use(insights);

      search.addWidgets([
        hits({
          container,
          templates: {
            item: (item, bindEvent) => `
              <button type='button' ${bindEvent(
                'conversion',
                item,
                'Product Ordered'
              )}>
                ${item.name}
              </button>
            `,
          },
        }),
      ]);
      search.start();
      await wait(0);

      // view event by render
      expect(onEvent).toHaveBeenCalledTimes(1);
      onEvent.mockClear();

      fireEvent.click(getByText(container, 'Name 2'));

      // The custom one + default click
      expect(onEvent).toHaveBeenCalledTimes(2);
      expect(onEvent.mock.calls[0][0]).toEqual({
        eventType: 'conversion',
        hits: [
          {
            __hitIndex: 1,
            __position: 2,
            objectID: '2',
            name: 'Name 2',
          },
        ],
        insightsMethod: 'convertedObjectIDsAfterSearch',
        payload: {
          eventName: 'Product Ordered',
          index: 'indexName',
          objectIDs: ['2'],
        },
        widgetType: 'ais.hits',
      });
      expect(onEvent.mock.calls[1][0]).toEqual({
        eventType: 'click',
        eventModifier: 'internal',
        hits: [
          {
            __position: 2,
            objectID: '2',
            name: 'Name 2',
          },
        ],
        insightsMethod: 'clickedObjectIDsAfterSearch',
        payload: {
          eventName: 'Hit Clicked',
          index: 'indexName',
          objectIDs: ['2'],
          positions: [2],
        },
        widgetType: 'ais.hits',
      });
    });

    describe('old insights methods', () => {
      it('sends event', async () => {
        const aa = jest.fn();
        const hitsPerPage = 2;
        const search = instantsearch({
          indexName: 'indexName',
          searchClient: createMockedSearchClient({
            hitsPerPage,
            clickAnalytics: true,
          }),
          insightsClient: aa,
        });

        const container = document.createElement('div');

        search.addWidgets([configure({ hitsPerPage })]);

        search.addWidgets([
          hits({
            container,
            templates: {
              item: (item) => `
                <button type='button' ${instantsearch.insights(
                  'clickedObjectIDsAfterSearch',
                  {
                    objectIDs: [item.objectID],
                    eventName: 'Add to cart',
                  }
                )}>
                  ${item.name}
                </button>
              `,
            },
          }),
        ]);
        search.start();
        await wait(0);

        fireEvent.click(getByText(container, 'Name 1'));
        expect(aa).toHaveBeenCalledTimes(1);
        expect(aa).toHaveBeenCalledWith('clickedObjectIDsAfterSearch', {
          eventName: 'Add to cart',
          index: 'indexName',
          objectIDs: ['1'],
          positions: [1],
          queryID: 'test-query-id',
        });
      });
    });

    type CustomHit = { name: string };

    function createMockedSearchClient(
      subset: Partial<SearchResponse<CustomHit>> & {
        clickAnalytics?: boolean;
      } = { hitsPerPage: 2, page: 0, clickAnalytics: false }
    ) {
      return createSearchClient({
        search: jest.fn((requests) => {
          return Promise.resolve(
            createMultiSearchResponse(
              ...requests.map((request) => {
                return createSingleSearchResponse<any>({
                  index: request.indexName,
                  query: request.params?.query,
                  hits: Array(subset.hitsPerPage)
                    .fill(undefined)
                    .map((_, index) => ({
                      objectID: `${index + 1}`,
                      name: `Name ${index + 1}`,
                      ...(subset.clickAnalytics && {
                        __queryID: 'test-query-id',
                      }),
                    })),
                  ...subset,
                });
              })
            )
          );
        }),
      });
    }
  });
});
