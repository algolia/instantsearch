import {
  createRecommendResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';

import type { TrendingItemsWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptionsTests(
  setup: TrendingItemsWidgetSetup,
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

      expect(document.querySelector('.ais-TrendingItems'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-TrendingItems"
        >
          <h3
            class="ais-TrendingItems-title"
          >
            Trending items
          </h3>
          <div
            class="ais-TrendingItems-container"
          >
            <ol
              class="ais-TrendingItems-list"
            >
              <li
                class="ais-TrendingItems-item"
              >
                {
          "objectID": "1"
        }
              </li>
              <li
                class="ais-TrendingItems-item"
              >
                {
          "objectID": "2"
        }
              </li>
            </ol>
          </div>
        </section>
      `);
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

      expect(document.querySelector('.ais-TrendingItems'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-TrendingItems"
        >
          <h3
            class="ais-TrendingItems-title"
          >
            Trending items
          </h3>
          <div
            class="ais-TrendingItems-container"
          >
            <ol
              class="ais-TrendingItems-list"
            >
              <li
                class="ais-TrendingItems-item"
              >
                {
          "objectID": "(1)"
        }
              </li>
              <li
                class="ais-TrendingItems-item"
              >
                {
          "objectID": "(2)"
        }
              </li>
            </ol>
          </div>
        </section>
      `);
    });

    test('renders with no results', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          // This simulates receiving no recommendations
          maxRecommendations: 0,
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-TrendingItems'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-TrendingItems ais-TrendingItems--empty"
        >
          No results
        </section>
      `);
    });

    test('passes parameters correctly', async () => {
      const searchClient = createMockedSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          queryParameters: {
            query: 'regular query',
          },
          fallbackParameters: {
            query: 'fallback query',
          },
          threshold: 80,
          maxRecommendations: 3,
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.getRecommendations).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            queryParameters: {
              query: 'regular query',
            },
            fallbackParameters: {
              query: 'fallback query',
            },
            threshold: 80,
            maxRecommendations: 3,
          }),
        ])
      );
    });
  });
}

function createMockedSearchClient() {
  return createSearchClient({
    getRecommendations: jest.fn((requests) =>
      Promise.resolve(
        createRecommendResponse(
          // @ts-ignore
          // `request` will be implicitly typed as `any` in type-check:v3
          // since `getRecommendations` is not available there
          requests.map((request) => {
            return createSingleSearchResponse<any>({
              hits:
                request.maxRecommendations === 0
                  ? []
                  : [{ objectID: '1' }, { objectID: '2' }],
            });
          })
        )
      )
    ),
  });
}
