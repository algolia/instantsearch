import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { wait } from '@instantsearch/testutils';

import type { TrendingFacetsWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createOptionsTests(
  setup: TrendingFacetsWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('options', () => {
    test('renders with default props', async () => {
      const searchClient = createRecommendSearchClient({
        fixture: [{ facetName: 'attr', facetValue: 'value' }],
      });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'name',
          templates: { item: (item) => item.objectID },
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-TrendingFacets'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-TrendingFacets"
        >
          <h3
            class="ais-TrendingFacets-title"
          >
            Trending facets
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
                attr:value
              </li>
            </ol>
          </div>
        </section>
      `);
    });

    test('renders transformed items', async () => {
      const searchClient = createRecommendSearchClient({
        fixture: [
          { facetName: 'attr', facetValue: 'value' },
          { facetName: 'attr2', facetValue: 'value2' },
        ],
      });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'name',
          templates: { item: (item) => JSON.stringify(item) },
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

      expect(document.querySelector('.ais-TrendingFacets'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-TrendingFacets"
        >
          <h3
            class="ais-TrendingFacets-title"
          >
            Trending facets
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
                {"objectID":"(attr:value)","attribute":"attr","value":"value","__position":1}
              </li>
              <li
                class="ais-TrendingFacets-item"
              >
                {"objectID":"(attr2:value2)","attribute":"attr2","value":"value2","__position":2}
              </li>
            </ol>
          </div>
        </section>
      `);
    });

    test('renders with no results', async () => {
      const searchClient = createRecommendSearchClient({
        fixture: [],
      });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          // This simulates receiving no recommendations
          limit: 0,
          attribute: 'name',
          templates: { item: (item) => item.objectID },
        },
      });

      await act(async () => {
        await wait(0);
      });

      expect(document.querySelector('.ais-TrendingFacets'))
        .toMatchInlineSnapshot(`
        <section
          class="ais-TrendingFacets ais-TrendingFacets--empty"
        >
          No results
        </section>
      `);
    });

    test('passes parameters correctly', async () => {
      const searchClient = createRecommendSearchClient({
        fixture: [
          { facetName: 'attr', facetValue: 'value' },
          { facetName: 'attr2', facetValue: 'value2' },
        ],
      });

      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          attribute: 'name',
          templates: { item: (item) => item.objectID },
          threshold: 80,
          limit: 3,
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
          }),
        ])
      );
    });
  });
}
