import { createMockedSearchClientWithRecommendations } from '@instantsearch/mocks/fixtures';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';

import { skippableDescribe } from '../../common';

import type { TrendingItemsConnectorSetup } from '.';
import type { SetupOptions, TestOptions } from '../../common';

export function createOptionsTests(
  setup: TrendingItemsConnectorSetup,
  { act, skippedTests }: Required<TestOptions>
) {
  skippableDescribe('options', skippedTests, () => {
    test('forwards parameters to the client', async () => {
      const searchClient = createMockedSearchClientWithRecommendations();
      const options: SetupOptions<TrendingItemsConnectorSetup> = {
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          facetName: 'facetName',
          facetValue: 'facetValue',
          maxRecommendations: 2,
          threshold: 3,
          fallbackParameters: { facetFilters: ['test1'] },
          queryParameters: { analytics: true },
          escapeHTML: false,
        },
      };

      await setup(options);

      expect(searchClient.getRecommendations).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            maxRecommendations: 2,
            threshold: 3,
            fallbackParameters: { facetFilters: ['test1'] },
            queryParameters: { analytics: true },
            model: 'trending-items',
            indexName: 'indexName',
          }),
        ])
      );
    });

    test('returns recommendations', async () => {
      const options: SetupOptions<TrendingItemsConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createMockedSearchClientWithRecommendations(),
        },
        widgetParams: {},
      };

      await setup(options);

      expect(screen.getByRole('list')).toMatchInlineSnapshot(`<ul />`);

      await act(async () => {
        await wait(0);
      });

      expect(screen.getByRole('list')).toMatchInlineSnapshot(`
        <ul>
          <li>
            1
          </li>
          <li>
            2
          </li>
        </ul>
      `);
    });

    test('transforms recommendations', async () => {
      const options: SetupOptions<TrendingItemsConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createMockedSearchClientWithRecommendations({
            minimal: true,
          }),
        },
        widgetParams: {
          transformItems(items) {
            return items.map((item) => ({
              ...item,
              objectID: `(${item.objectID})`,
            }));
          },
        },
      };

      await setup(options);

      expect(screen.getByRole('list')).toMatchInlineSnapshot(`<ul />`);

      await act(async () => {
        await wait(0);
      });

      expect(screen.getByRole('list')).toMatchInlineSnapshot(`
        <ul>
          <li>
            (1)
          </li>
          <li>
            (2)
          </li>
        </ul>
      `);
    });
  });
}
