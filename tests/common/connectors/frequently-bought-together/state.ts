import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';

import { skippableDescribe } from '../../common';

import type { FrequentlyBoughtTogetherConnectorSetup } from '.';
import type { TestOptions } from '../../common';

export function createStateTests(
  setup: FrequentlyBoughtTogetherConnectorSetup,
  { act, skippedTests }: Required<TestOptions>
) {
  skippableDescribe('state', skippedTests, () => {
    test('sets the proper number of queries', async () => {
      const searchClient = createRecommendSearchClient();
      await setup({
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient,
        },
        widgetParams: {
          objectIDs: ['1', '2'],
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
          objectID: '1',
          model: 'bought-together',
          indexName: 'indexName',
        }),
        expect.objectContaining({
          objectID: '2',
          model: 'bought-together',
          indexName: 'indexName',
        }),
      ]);
    });
  });
}
