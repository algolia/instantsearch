import { createTrendingFacetsSearchClient } from '@instantsearch/mocks/fixtures';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';

import { skippableDescribe } from '../../common';

import type { TrendingFacetsConnectorSetup } from '.';
import type { TestOptions } from '../../common';

export function createStateTests(
  setup: TrendingFacetsConnectorSetup,
  { act, skippedTests }: Required<TestOptions>
) {
  skippableDescribe('state', skippedTests, () => {
    test('sets the proper number of queries', async () => {
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

      expect(searchClient.getRecommendations).toHaveBeenCalledTimes(1);

      // removing the widget
      await act(async () => {
        screen.getByRole('button').click();
        await wait(0);
      });

      // adding the same widget again
      await act(async () => {
        screen.getByRole('button').click();
        await wait(0);
      });

      expect(searchClient.getRecommendations).toHaveBeenCalledTimes(2);
      expect(searchClient.getRecommendations).toHaveBeenLastCalledWith([
        expect.objectContaining({
          model: 'trending-facets',
          indexName: 'indexName',
          facetName: 'brand',
        }),
      ]);
    });
  });
}
