import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { wait } from '@instantsearch/testutils';
import { TAG_PLACEHOLDER } from 'instantsearch.js/es/lib/utils';

import type { RelatedProductsWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptionsTests(
  setup: RelatedProductsWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with default props', async () => {
      const searchClient = createRecommendSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          objectIDs: ['1'],
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-RelatedProducts'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-RelatedProducts"
        >
          <h3
            class="ais-RelatedProducts-title"
          >
            Related products
          </h3>
          <div
            class="ais-RelatedProducts-container"
          >
            <ol
              class="ais-RelatedProducts-list"
            >
              <li
                class="ais-RelatedProducts-item"
              >
                {
          "_highlightResult": {
            "name": {
              "matchLevel": "none",
              "matchedWords": [],
              "value": "&lt;em&gt;Moschino Love&lt;/em&gt; – Shoulder bag"
            }
          },
          "name": "Moschino Love – Shoulder bag",
          "objectID": "1"
        }
              </li>
              <li
                class="ais-RelatedProducts-item"
              >
                {
          "_highlightResult": {
            "name": {
              "matchLevel": "none",
              "matchedWords": [],
              "value": "&lt;em&gt;Bag&lt;/em&gt; “Sabrina“ medium Gabs"
            }
          },
          "name": "Bag “Sabrina“ medium Gabs",
          "objectID": "2"
        }
              </li>
            </ol>
          </div>
        </section>
      `);
    });

    test('renders transformed items', async () => {
      const searchClient = createRecommendSearchClient({
        minimal: true,
      });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          objectIDs: ['1'],
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

      expect(document.querySelector('.ais-RelatedProducts'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-RelatedProducts"
        >
          <h3
            class="ais-RelatedProducts-title"
          >
            Related products
          </h3>
          <div
            class="ais-RelatedProducts-container"
          >
            <ol
              class="ais-RelatedProducts-list"
            >
              <li
                class="ais-RelatedProducts-item"
              >
                {
          "objectID": "(1)"
        }
              </li>
              <li
                class="ais-RelatedProducts-item"
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
      const searchClient = createRecommendSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          objectIDs: ['1'],
          // This simulates receiving no recommendations
          maxRecommendations: 0,
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-RelatedProducts'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-RelatedProducts ais-RelatedProducts--empty"
        >
          No results
        </section>
      `);
    });

    test('passes parameters correctly', async () => {
      const searchClient = createRecommendSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          objectIDs: ['objectID'],
          queryParameters: {
            query: 'regular query',
          },
          fallbackParameters: {
            query: 'fallback query',
          },
          threshold: 80,
          maxRecommendations: 3,
          escapeHTML: false,
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.getRecommendations).toHaveBeenCalledWith([
        expect.objectContaining({
          objectID: 'objectID',
          queryParameters: {
            query: 'regular query',
          },
          fallbackParameters: {
            query: 'fallback query',
          },
          threshold: 80,
          maxRecommendations: 3,
        }),
      ]);
    });

    test('escapes html entities when `escapeHTML` is true', async () => {
      const searchClient = createRecommendSearchClient();
      let recommendItems: Parameters<
        NonNullable<
          Parameters<RelatedProductsWidgetSetup>[0]['widgetParams']['transformItems']
        >
      >[0] = [];

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          objectIDs: ['objectID'],
          queryParameters: {
            query: 'regular query',
          },
          transformItems: (items) => {
            recommendItems = items;
            return items;
          },
          escapeHTML: true,
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.getRecommendations).toHaveBeenCalledWith([
        expect.objectContaining({
          queryParameters: {
            query: 'regular query',
            ...TAG_PLACEHOLDER,
          },
        }),
      ]);

      expect(recommendItems[0]._highlightResult!.name).toEqual({
        matchLevel: 'none',
        matchedWords: [],
        value: '&lt;em&gt;Moschino Love&lt;/em&gt; – Shoulder bag',
      });
    });
  });
}
