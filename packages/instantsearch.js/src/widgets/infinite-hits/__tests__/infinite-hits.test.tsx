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
import searchBox from '../../search-box/search-box';
import infiniteHits from '../infinite-hits';

import type { SearchResponse } from '../../../../src/types';
import type { MockSearchClient } from '@instantsearch/mocks';

const bannerWidgetRenderingContent = {
  widgets: {
    banners: [
      {
        image: {
          urls: [{ url: 'https://via.placeholder.com/550x250' }],
        },
        link: {
          url: 'https://www.algolia.com',
        },
      },
    ],
  },
};

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('infiniteHits', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createSearchClient();

        const search = instantsearch({
          indexName: 'indexName',
          searchClient,
        });

        search.addWidgets([
          infiniteHits({
            // @ts-expect-error
            container: undefined,
          }),
        ]);
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/infinite-hits/js/"
      `);
    });

    test('adds custom CSS classes', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient({
        // @TODO: remove once algoliasearch js client has been updated
        // @ts-expect-error
        renderingContent: bannerWidgetRenderingContent,
      });

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
        infiniteHits({
          container,
          showPrevious: true,
          cssClasses: {
            root: 'ROOT',
            emptyRoot: 'EMPTY_ROOT',
            list: 'LIST',
            item: 'ITEM',
            loadPrevious: 'LOAD_PREVIOUS',
            loadMore: 'LOAD_MORE',
            disabledLoadPrevious: 'DISABLED_LOAD_PREVIOUS',
            disabledLoadMore: 'DISABLED_LOAD_MORE',
            bannerRoot: 'BANNER_ROOT',
            bannerImage: 'BANNER_IMAGE',
            bannerLink: 'BANNER_LINK',
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container.querySelector('.ais-InfiniteHits')).toHaveClass('ROOT');
      expect(container.querySelector('.ais-InfiniteHits-list')).toHaveClass(
        'LIST'
      );
      expect(container.querySelector('.ais-InfiniteHits-item')).toHaveClass(
        'ITEM'
      );
      expect(
        container.querySelector('.ais-InfiniteHits-loadPrevious')
      ).toHaveClass('LOAD_PREVIOUS DISABLED_LOAD_PREVIOUS');
      expect(container.querySelector('.ais-InfiniteHits-loadMore')).toHaveClass(
        'LOAD_MORE DISABLED_LOAD_MORE'
      );
      expect(container.querySelector('.ais-InfiniteHits-banner')).toHaveClass(
        'BANNER_ROOT'
      );
      expect(
        container.querySelector('.ais-InfiniteHits-banner-image')
      ).toHaveClass('BANNER_IMAGE');
      expect(
        container.querySelector('.ais-InfiniteHits-banner-link')
      ).toHaveClass('BANNER_LINK');
    });

    type CustomRecord = { somethingSpecial: string };

    function createMockedSearchClient(
      subset: Partial<SearchResponse<CustomRecord>> = {}
    ) {
      return createSearchClient({
        search: jest.fn((requests) =>
          Promise.resolve(
            createMultiSearchResponse(
              ...requests.map(
                (
                  request: Parameters<MockSearchClient['search']>[0][number]
                ) => {
                  const { hitsPerPage = 3, page = 0 } = request.params!;
                  const hits = Array.from({ length: hitsPerPage }, (_, i) => {
                    const offset = hitsPerPage * page;

                    return {
                      objectID: (i + offset).toString(),
                      somethingSpecial: String.fromCharCode(
                        'a'.charCodeAt(0) + i + offset
                      ),
                    };
                  });

                  return createSingleSearchResponse<CustomRecord>({
                    index: request.indexName,
                    query: request.params?.query,
                    hits,
                    page,
                    nbPages: 1,
                    hitsPerPage,
                    ...subset,
                  });
                }
              )
            )
          )
        ) as MockSearchClient['search'],
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
        infiniteHits({ container, showPrevious: true }),
      ]);

      search.start();
      // prevent warning from insights view event because insightsClient isn't yet loaded
      search.mainHelper!.state.userToken = 'userToken';

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-InfiniteHits"
          >
            <button
              class="ais-InfiniteHits-loadPrevious ais-InfiniteHits-loadPrevious--disabled"
              disabled=""
            >
              Show previous results
            </button>
            <ol
              class="ais-InfiniteHits-list"
            >
              <li
                class="ais-InfiniteHits-item"
              >
                <div
                  style="word-break: break-all;"
                >
                  {"objectID":"1","name":"Apple iPhone smartphone","description":"A smartphone by Apple.","_highlightR
                  …
                </div>
              </li>
              <li
                class="ais-InfiniteHits-item"
              >
                <div
                  style="word-break: break-all;"
                >
                  {"objectID":"2","name":"Samsung Galaxy smartphone","description":"A smartphone by Samsung.","_highli
                  …
                </div>
              </li>
            </ol>
            <button
              class="ais-InfiniteHits-loadMore ais-InfiniteHits-loadMore--disabled"
              disabled=""
            >
              Show more results
            </button>
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
            class="ais-InfiniteHits ais-InfiniteHits--empty"
          >
            No results
          </div>
        </div>
      `);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchBoxContainer = document.createElement('div');
      const searchClient = createMockedSearchClient({
        // @TODO: remove once algoliasearch js client has been updated
        // @ts-expect-error
        renderingContent: bannerWidgetRenderingContent,
      });

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        searchBox({ container: searchBoxContainer }),
        infiniteHits({
          container,
          showPrevious: true,
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
            showPreviousText(_, { html }) {
              return html`<span>Show previous</span>`;
            },
            showMoreText(_, { html }) {
              return html`<span>Show more</span>`;
            },
            empty({ query }, { html }) {
              return html`<p>No results for <q>${query}</q></p>`;
            },
            banner({ banner, className }, { html }) {
              return html`<div class="${className}">
                <img src="${banner?.image.urls[0].url}" />
              </div>`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-InfiniteHits"
          >
            <button
              class="ais-InfiniteHits-loadPrevious ais-InfiniteHits-loadPrevious--disabled"
              disabled=""
            >
              <span>
                Show previous
              </span>
            </button>
            <div
              class="ais-InfiniteHits-banner"
            >
              <img
                src="https://via.placeholder.com/550x250"
              />
            </div>
            <ol
              class="ais-InfiniteHits-list"
            >
              <li
                class="ais-InfiniteHits-item"
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
                class="ais-InfiniteHits-item"
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
            <button
              class="ais-InfiniteHits-loadMore ais-InfiniteHits-loadMore--disabled"
              disabled=""
            >
              <span>
                Show more
              </span>
            </button>
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
            class="ais-InfiniteHits ais-InfiniteHits--empty"
          >
            <div
              class="ais-InfiniteHits-banner"
            >
              <img
                src="https://via.placeholder.com/550x250"
              />
            </div>
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
        infiniteHits({
          container,
          showPrevious: true,
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
            showPreviousText() {
              return <span>Show previous</span>;
            },
            showMoreText() {
              return <span>Show more</span>;
            },
            empty({ query }) {
              return (
                <p>
                  No results for <q>${query}</q>
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
            class="ais-InfiniteHits"
          >
            <button
              class="ais-InfiniteHits-loadPrevious ais-InfiniteHits-loadPrevious--disabled"
              disabled=""
            >
              <span>
                Show previous
              </span>
            </button>
            <ol
              class="ais-InfiniteHits-list"
            >
              <li
                class="ais-InfiniteHits-item"
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
                class="ais-InfiniteHits-item"
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
            <button
              class="ais-InfiniteHits-loadMore ais-InfiniteHits-loadMore--disabled"
              disabled=""
            >
              <span>
                Show more
              </span>
            </button>
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
            class="ais-InfiniteHits ais-InfiniteHits--empty"
          >
            <p>
              No results for 
              <q>
                $
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
      search.addWidgets([
        infiniteHits({ container: document.createElement('div') }),
      ]);
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
          widgetType: 'ais.infiniteHits',
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
      search.addWidgets([infiniteHits({ container })]);
      search.start();

      await wait(0);

      onEvent.mockClear();

      userEvent.click(container.querySelectorAll('.ais-InfiniteHits-item')[0]);

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
          widgetType: 'ais.infiniteHits',
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
        infiniteHits({
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
        widgetType: 'ais.infiniteHits',
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
        infiniteHits({
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
        widgetType: 'ais.infiniteHits',
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
        widgetType: 'ais.infiniteHits',
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
