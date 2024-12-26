import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import {
  normalizeSnapshot as commonNormalizeSnapshot,
  wait,
} from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import type { InfiniteHitsWidgetSetup } from '.';
import type { TestOptions } from '../../common';
import type { MockSearchClient } from '@instantsearch/mocks';
import type { PlainSearchParameters } from 'algoliasearch-helper';
import type {
  InfiniteHitsCache,
  InfiniteHitsCachedItems,
} from 'instantsearch-core';
import type { BaseHit, SearchResponse } from 'instantsearch.js';

function normalizeSnapshot(html: string) {
  // Each flavor has its own way to render the hit by default.
  // @MAJOR: Remove this once all flavors are aligned.
  return (
    commonNormalizeSnapshot(html)
      // React InstantSearch shows the "Load Previous" button by default, unlike
      // the other flavors
      .replace(
        /<button class="ais-InfiniteHits-loadPrevious .*?">.*?<\/button>/,
        ''
      )
      // Vue InstantSearch adds new line between banner and hits
      .replace(/>\s*</g, '><')
  );
}

export function createOptionsTests(
  setup: InfiniteHitsWidgetSetup,
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
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('#hits-with-defaults .ais-InfiniteHits')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-InfiniteHits"
        >
          <ol
            class="ais-InfiniteHits-list"
          >
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"0","__position":1}…
              </div>
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"1","__position":2}…
              </div>
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"2","__position":3}…
              </div>
            </li>
          </ol>
          <button
            class="ais-InfiniteHits-loadMore"
          >
            Show more results
          </button>
        </div>
      `
      );
    });

    test('renders default banner element with banner widget renderingContent', async () => {
      const searchClient = createMockedSearchClient({
        renderingContent: {
          // @TODO: remove once algoliasearch js client has been updated
          // @ts-expect-error
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
        },
      });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('#hits-with-defaults .ais-InfiniteHits')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-InfiniteHits"
        >
          <aside
            class="ais-InfiniteHits-banner"
          >
            <a
              class="ais-InfiniteHits-banner-link"
              href="https://www.algolia.com"
            >
              <img
                class="ais-InfiniteHits-banner-image"
                src="https://via.placeholder.com/550x250"
              />
            </a>
          </aside>
          <ol
            class="ais-InfiniteHits-list"
          >
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"0","__position":1}…
              </div>
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"1","__position":2}…
              </div>
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"2","__position":3}…
              </div>
            </li>
          </ol>
          <button
            class="ais-InfiniteHits-loadMore"
          >
            Show more results
          </button>
        </div>
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
          transformItems(items) {
            return items.map((item) => ({
              ...item,
              objectID: `(${item.objectID})`,
            }));
          },
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('#hits-with-defaults .ais-InfiniteHits')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-InfiniteHits"
        >
          <ol
            class="ais-InfiniteHits-list"
          >
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"(0)","__position":1}…
              </div>
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"(1)","__position":2}…
              </div>
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"(2)","__position":3}…
              </div>
            </li>
          </ol>
          <button
            class="ais-InfiniteHits-loadMore"
          >
            Show more results
          </button>
        </div>
      `
      );
    });

    test('displays more hits when clicking the "Show More" button', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {},
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('#hits-with-defaults .ais-InfiniteHits-item')
      ).toHaveLength(3);

      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            indexName: 'indexName',
            params: expect.objectContaining({
              page: 0,
            }),
          }),
        ])
      );

      act(() => {
        userEvent.click(
          document.querySelector(
            '#hits-with-defaults .ais-InfiniteHits-loadMore'
          )!
        );
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('#hits-with-defaults .ais-InfiniteHits-item')
      ).toHaveLength(6);

      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            indexName: 'indexName',
            params: expect.objectContaining({
              page: 1,
            }),
          }),
        ])
      );
    });

    test('displays previous hits when clicking the "Show Previous" button', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          initialUiState: { indexName: { page: 4 } },
        },
        widgetParams: { showPrevious: true },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('#hits-with-defaults .ais-InfiniteHits-item')
      ).toHaveLength(3);

      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            indexName: 'indexName',
            params: expect.objectContaining({
              page: 3,
            }),
          }),
        ])
      );

      act(() => {
        userEvent.click(
          document.querySelector(
            '#hits-with-defaults .ais-InfiniteHits-loadPrevious'
          )!
        );
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelectorAll('#hits-with-defaults .ais-InfiniteHits-item')
      ).toHaveLength(6);

      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            indexName: 'indexName',
            params: expect.objectContaining({
              page: 2,
            }),
          }),
        ])
      );
    });

    test('hides the "Show Previous" button when `showPrevious` is `false`', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          initialUiState: { indexName: { page: 4 } },
        },
        widgetParams: { showPrevious: false },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector(
          '#hits-with-defaults .ais-InfiniteHits-loadPrevious'
        )
      ).toBe(null);
    });

    test('marks the "Show Previous" button as disabled on first page', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: { showPrevious: true },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector<HTMLButtonElement>(
          '#hits-with-defaults .ais-InfiniteHits-loadPrevious'
        )
      ).toBeDisabled();

      expect(
        document.querySelector<HTMLButtonElement>(
          '#hits-with-defaults .ais-InfiniteHits-loadPrevious'
        )
      ).toHaveClass(
        'ais-InfiniteHits-loadPrevious',
        'ais-InfiniteHits-loadPrevious--disabled'
      );
    });

    test('marks the "Show More" button as disabled on last page', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
          initialUiState: { indexName: { page: 10 } },
        },
        widgetParams: { showPrevious: true },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector<HTMLButtonElement>(
          '#hits-with-defaults .ais-InfiniteHits-loadMore'
        )
      ).toBeDisabled();

      expect(
        document.querySelector<HTMLButtonElement>(
          '#hits-with-defaults .ais-InfiniteHits-loadMore'
        )
      ).toHaveClass(
        'ais-InfiniteHits-loadMore',
        'ais-InfiniteHits-loadMore--disabled'
      );
    });

    test('writes hits to cache', async () => {
      const searchClient = createMockedSearchClient();
      const { cache } = createCustomCache();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: { cache },
      });

      await act(async () => {
        await wait(0);
      });

      expect(cache.write).toHaveBeenCalledTimes(1);
      expect(cache.write.mock.calls[0][0].items).toEqual({
        '0': [
          { __position: 1, objectID: '0' },
          { __position: 2, objectID: '1' },
          { __position: 3, objectID: '2' },
        ],
      });

      act(() => {
        userEvent.click(
          document.querySelector(
            '#hits-with-defaults .ais-InfiniteHits-loadMore'
          )!
        );
      });

      await act(async () => {
        await wait(0);
      });

      expect(cache.write).toHaveBeenCalledTimes(2);
      expect(cache.write.mock.calls[0][0].items).toEqual({
        '0': [
          { __position: 1, objectID: '0' },
          { __position: 2, objectID: '1' },
          { __position: 3, objectID: '2' },
        ],
        '1': [
          { __position: 4, objectID: '3' },
          { __position: 5, objectID: '4' },
          { __position: 6, objectID: '5' },
        ],
      });
    });

    test('reads hits from cache', async () => {
      const searchClient = createMockedSearchClient();
      const { cache } = createCustomCache();

      // We write in cache before instantiating InstantSearch to mimic a
      // pre-filled cache from previous searches (e.g., after a page refresh)
      cache.write({
        items: {
          '0': [
            { __position: 1, objectID: 'one' },
            { __position: 2, objectID: 'two' },
            { __position: 3, objectID: 'three' },
          ],
        },
        state: {
          disjunctiveFacets: [],
          disjunctiveFacetsRefinements: {},
          facets: [],
          facetsExcludes: {},
          facetsRefinements: {},
          hierarchicalFacets: [],
          hierarchicalFacetsRefinements: {},
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
          index: 'indexName',
          numericRefinements: {},
          page: 0,
          query: '',
          tagRefinements: [],
        },
      });

      setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: { cache },
      });

      await act(async () => {
        await wait(0);
      });

      // Cached hits are rendered
      expect(
        document.querySelector('#hits-with-defaults .ais-InfiniteHits')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <div
          class="ais-InfiniteHits"
        >
          <ol
            class="ais-InfiniteHits-list"
          >
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"__position":1,"objectID":"one"}…
              </div>
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"__position":2,"objectID":"two"}…
              </div>
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"__position":3,"objectID":"three"}…
              </div>
            </li>
          </ol>
          <button
            class="ais-InfiniteHits-loadMore"
          >
            Show more results
          </button>
        </div>
      `
      );
    });
  });
}

function createMockedSearchClient(
  subset: Partial<SearchResponse<BaseHit>> = {}
) {
  return createSearchClient({
    search: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          ...requests.map(
            (request: Parameters<MockSearchClient['search']>[0][number]) => {
              const { hitsPerPage = 3, page = 0 } = request.params!;
              const hits = Array.from({ length: hitsPerPage }, (_, i) => {
                const offset = hitsPerPage * page;

                return { objectID: (i + offset).toString() };
              });

              return createSingleSearchResponse({
                index: request.indexName,
                query: request.params?.query,
                hits,
                page,
                nbPages: 10,
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

function createCustomCache() {
  function getStateWithoutPage(state: PlainSearchParameters) {
    const { page, ...rest } = state || {};

    return rest;
  }

  function sort<TValue extends BaseHit>(obj: TValue = {} as TValue) {
    return Object.entries(obj).sort();
  }

  function isEqual<TValue extends BaseHit>(
    a: TValue | undefined,
    b: TValue | undefined
  ) {
    return JSON.stringify(sort(a)) === JSON.stringify(sort(b));
  }

  let cachedState: PlainSearchParameters | undefined = undefined;

  let cachedHits: InfiniteHitsCachedItems<Record<string, any>> | undefined =
    undefined;

  type Cache = InfiniteHitsCache<Record<string, any>> & { clear: () => void };

  type MockedCache = { [key in keyof Cache]: jest.MockedFunction<Cache[key]> };

  const cache: MockedCache = {
    read: jest.fn(({ state }) => {
      const shouldReturnFromCache = isEqual(
        cachedState,
        getStateWithoutPage(state)
      );

      if (shouldReturnFromCache) {
        return cachedHits!;
      }

      return null;
    }),
    write: jest.fn(({ state, items }) => {
      cachedState = getStateWithoutPage(state);
      cachedHits = items;
    }),
    clear: jest.fn(() => {
      cachedState = undefined;
      cachedHits = undefined;
    }),
  };

  return { cachedState, cachedHits, cache };
}
