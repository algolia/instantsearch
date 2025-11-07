import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';

import { skippableDescribe } from '../../common';

import type { FrequentlyBoughtTogetherConnectorSetup } from '.';
import type { SetupOptions, TestOptions } from '../../common';

export function createOptionsTests(
  setup: FrequentlyBoughtTogetherConnectorSetup,
  { act, skippedTests }: Required<TestOptions>
) {
  skippableDescribe('options', skippedTests, () => {
    test('throws when not passing the `objectIDs` option', async () => {
      const options: SetupOptions<FrequentlyBoughtTogetherConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createRecommendSearchClient(),
        },
        widgetParams: {
          // @ts-expect-error
          objectIDs: undefined,
        },
      };

      await expect(async () => {
        await setup(options);
      }).rejects.toThrowErrorMatchingInlineSnapshot(`
              "The \`objectIDs\` option is required.

              See documentation: https://www.algolia.com/doc/api-reference/widgets/frequently-bought-together/js/#connector"
            `);
    });

    test('forwards parameters to the client', async () => {
      const searchClient = createRecommendSearchClient();
      const options: SetupOptions<FrequentlyBoughtTogetherConnectorSetup> = {
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          objectIDs: ['1', '2'],
          limit: 2,
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
            objectID: '1',
            maxRecommendations: 2,
            threshold: 3,
            fallbackParameters: { facetFilters: ['test1'] },
            queryParameters: { analytics: true },
            model: 'bought-together',
            indexName: 'indexName',
          }),
          expect.objectContaining({
            objectID: '2',
            maxRecommendations: 2,
            threshold: 3,
            fallbackParameters: { facetFilters: ['test1'] },
            queryParameters: { analytics: true },
            model: 'bought-together',
            indexName: 'indexName',
          }),
        ])
      );
    });

    test('returns recommendations', async () => {
      const options: SetupOptions<FrequentlyBoughtTogetherConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createRecommendSearchClient(),
        },
        widgetParams: { objectIDs: ['1'] },
      };

      await setup(options);

      expect(screen.getByRole('list')).toMatchInlineSnapshot('<ul />');

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
      const options: SetupOptions<FrequentlyBoughtTogetherConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createRecommendSearchClient(),
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
      };

      await setup(options);

      expect(screen.getByRole('list')).toMatchInlineSnapshot('<ul />');

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
