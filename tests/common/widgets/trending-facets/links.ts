import { createTrendingFacetsSearchClient } from '@instantsearch/mocks/fixtures';
import { wait } from '@instantsearch/testutils';

import type { TrendingFacetsWidgetSetup } from '.';
import type { TestOptions } from '../../common';

export function createLinksTests(
  setup: TrendingFacetsWidgetSetup,
  { act }: Required<TestOptions>
) {
  describe('links', () => {
    test("a click on a link with modifier doesn't search", async () => {
      const delay = 100;
      const margin = 10;
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createTrendingFacetsSearchClient(),
        },
        widgetParams: {
          facetName: 'brand',
        },
      };

      await setup(options);

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      const container = document.querySelector('.ais-TrendingFacets')!;

      // Initial state, before interaction
      {
        expect(container.querySelectorAll('a')).toHaveLength(0);
        expect(
          options.instantSearchOptions.searchClient.getRecommendations
        ).toHaveBeenCalledTimes(1);
      }
    });
  });
}
