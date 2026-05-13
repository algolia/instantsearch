import { createTrendingFacetsSearchClient } from '@instantsearch/mocks/fixtures';
import { normalizeSnapshot, wait } from '@instantsearch/testutils';

import type { TrendingFacetsWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptionsTests(
  setup: TrendingFacetsWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with default props', async () => {
      const searchClient = createTrendingFacetsSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          facetName: 'brand',
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-TrendingFacets')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <section
          class="ais-TrendingFacets"
        >
          <h3
            class="ais-TrendingFacets-title"
          >
            Trending
          </h3>
          <div
            class="ais-TrendingFacets-container"
          >
            <ol
              class="ais-TrendingFacets-list"
            >
              <li
                class="ais-TrendingFacets-item"
              >
                Apple
              </li>
              <li
                class="ais-TrendingFacets-item"
              >
                Samsung
              </li>
            </ol>
          </div>
        </section>
      `);
    });

    test('renders transformed items', async () => {
      const searchClient = createTrendingFacetsSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          facetName: 'brand',
          transformItems(items) {
            return items.map((item) => ({
              ...item,
              facetValue: `(${item.facetValue})`,
            }));
          },
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-TrendingFacets')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <section
          class="ais-TrendingFacets"
        >
          <h3
            class="ais-TrendingFacets-title"
          >
            Trending
          </h3>
          <div
            class="ais-TrendingFacets-container"
          >
            <ol
              class="ais-TrendingFacets-list"
            >
              <li
                class="ais-TrendingFacets-item"
              >
                (Apple)
              </li>
              <li
                class="ais-TrendingFacets-item"
              >
                (Samsung)
              </li>
            </ol>
          </div>
        </section>
      `);
    });

    test('renders with no results', async () => {
      const searchClient = createTrendingFacetsSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          facetName: 'brand',
          limit: 0,
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(
        document.querySelector('.ais-TrendingFacets')
      ).toMatchNormalizedInlineSnapshot(
        normalizeSnapshot,
        `
        <section
          class="ais-TrendingFacets ais-TrendingFacets--empty"
        >
          No results
        </section>
      `);
    });

    test('passes parameters correctly', async () => {
      const searchClient = createTrendingFacetsSearchClient();

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          facetName: 'brand',
          threshold: 80,
          limit: 3,
          escapeHTML: false,
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(searchClient.getRecommendations).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            threshold: 80,
            maxRecommendations: 3,
            facetName: 'brand',
          }),
        ])
      );
    });
  });
}
