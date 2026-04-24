import { createTrendingFacetsSearchClient } from '@instantsearch/mocks/fixtures';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';

import { skippableDescribe } from '../../common';

import type { TrendingFacetsConnectorSetup } from '.';
import type { SetupOptions, TestOptions } from '../../common';

export function createOptionsTests(
  setup: TrendingFacetsConnectorSetup,
  { act, skippedTests }: Required<TestOptions>
) {
  skippableDescribe('options', skippedTests, () => {
    test('forwards parameters to the client', async () => {
      const searchClient = createTrendingFacetsSearchClient();
      const options: SetupOptions<TrendingFacetsConnectorSetup> = {
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          facetName: 'brand',
          limit: 2,
          threshold: 3,
          escapeHTML: false,
        },
      };

      await setup(options);

      expect(searchClient.getRecommendations).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            maxRecommendations: 2,
            threshold: 3,
            model: 'trending-facets',
            indexName: 'indexName',
            facetName: 'brand',
          }),
        ])
      );
    });

    test('returns recommendations', async () => {
      const options: SetupOptions<TrendingFacetsConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createTrendingFacetsSearchClient(),
        },
        widgetParams: {
          facetName: 'brand',
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
            Apple
          </li>
          <li>
            Samsung
          </li>
        </ul>
      `);
    });

    test('transforms recommendations', async () => {
      const options: SetupOptions<TrendingFacetsConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createTrendingFacetsSearchClient(),
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
      };

      await setup(options);

      expect(screen.getByRole('list')).toMatchInlineSnapshot(`<ul />`);

      await act(async () => {
        await wait(0);
      });

      expect(screen.getByRole('list')).toMatchInlineSnapshot(`
        <ul>
          <li>
            (Apple)
          </li>
          <li>
            (Samsung)
          </li>
        </ul>
      `);
    });
  });
}
