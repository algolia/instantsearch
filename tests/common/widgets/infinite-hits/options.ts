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
import type { BaseHit, Hit, SearchResponse } from 'instantsearch.js';
import type {
  InfiniteHitsCache,
  InfiniteHitsCachedHits,
} from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits';

function normalizeSnapshot(html: string) {
  // Each flavor has its own way to render the hit by default.
  // @MAJOR: Remove this once all flavors are aligned.
  return (
    commonNormalizeSnapshot(html)
      .replace(
        /(?:<div\s+style="word-break: break-all;"\s*?>)?\s*?({.+?})…?\s*?(?:<\/div>)?/gs,
        (_, captured) => {
          return (captured as string)
            .replace(/\s/g, '')
            .replace(/,"__position":\d/, '');
        }
      )
      // React InstantSearch shows the "Load Previous" button by default, unlike
      // the other flavors
      .replace(
        /<button class="ais-InfiniteHits-loadPrevious .*?">.*?<\/button>/,
        ''
      )
      // Vue InstantSearch doesn't render defaults hits like the other flavors
      .replace(
        /\s{0,}(objectID): (.+?), index: \d\s{0,}/gs,
        (_, ...captured) => {
          return `{"objectID":"${captured[1]}"}`;
        }
      )
      .replace(/"__position":\d,/g, '')
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
              {"objectID":"0"}
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              {"objectID":"1"}
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              {"objectID":"2"}
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
            return (items as unknown as Array<Hit<CustomRecord>>).map(
              (item) => ({
                ...item,
                objectID: `(${item.objectID})`,
              })
            );
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
              {"objectID":"(0)"}
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              {"objectID":"(1)"}
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              {"objectID":"(2)"}
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
      expect(cache.write.mock.calls[0][0].hits).toEqual({
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
      expect(cache.write.mock.calls[0][0].hits).toEqual({
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
        hits: {
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
              {"objectID":"one"}
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              {"objectID":"two"}
            </li>
            <li
              class="ais-InfiniteHits-item"
            >
              {"objectID":"three"}
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

type CustomRecord = { somethingSpecial?: string };

function createMockedSearchClient(
  subset: Partial<SearchResponse<CustomRecord>> = {}
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

              return createSingleSearchResponse<CustomRecord>({
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

  let cachedHits: InfiniteHitsCachedHits<Record<string, any>> | undefined =
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
    write: jest.fn(({ state, hits }) => {
      cachedState = getStateWithoutPage(state);
      cachedHits = hits;
    }),
    clear: jest.fn(() => {
      cachedState = undefined;
      cachedHits = undefined;
    }),
  };

  return { cachedState, cachedHits, cache };
}
