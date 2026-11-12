import {
  createRecommendResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { wait } from '@instantsearch/testutils';
import { screen } from '@testing-library/dom';
import { TAG_PLACEHOLDER } from 'instantsearch-core';

import { skippableDescribe } from '../../common';

import type { RelatedProductsConnectorSetup } from '.';
import type { SetupOptions, TestOptions } from '../../common';

export function createOptionsTests(
  setup: RelatedProductsConnectorSetup,
  { act, skippedTests }: Required<TestOptions>
) {
  skippableDescribe('options', skippedTests, () => {
    test('throws when not passing the `objectIDs` option', async () => {
      const options: SetupOptions<RelatedProductsConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createRecommendSearchClient(),
        },
        // @ts-expect-error missing `objectIDs`
        widgetParams: {},
      };

      await expect(async () => {
        await setup(options);
      }).rejects.toThrowErrorMatchingInlineSnapshot(`
              "The \`objectIDs\` option is required.

              See documentation: https://www.algolia.com/doc/api-reference/widgets/related-products/js/#connector"
            `);
    });

    test('forwards parameters to the client', async () => {
      const searchClient = createRecommendSearchClient();
      const options: SetupOptions<RelatedProductsConnectorSetup> = {
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          objectIDs: ['1', '2'],
          limit: 2,
          threshold: 3,
          fallbackParameters: { facetFilters: ['test1'] },
          queryParameters: { analytics: true },
        },
      };

      await setup(options);

      expect(searchClient.getRecommendations).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            objectID: '1',
            maxRecommendations: 2,
            threshold: 3,
            fallbackParameters: { facetFilters: ['test1'], ...TAG_PLACEHOLDER },
            queryParameters: { analytics: true, ...TAG_PLACEHOLDER },
            model: 'related-products',
            indexName: 'indexName',
          }),
          expect.objectContaining({
            objectID: '2',
            maxRecommendations: 2,
            threshold: 3,
            fallbackParameters: { facetFilters: ['test1'], ...TAG_PLACEHOLDER },
            queryParameters: { analytics: true, ...TAG_PLACEHOLDER },
            model: 'related-products',
            indexName: 'indexName',
          }),
        ])
      );
    });

    test('keeps custom highlight tags', async () => {
      const searchClient = createRecommendSearchClient();
      const customTags = { highlightPreTag: '<em>', highlightPostTag: '</em>' };
      const options: SetupOptions<RelatedProductsConnectorSetup> = {
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          objectIDs: ['1'],
          fallbackParameters: customTags,
          queryParameters: customTags,
        },
      };

      await setup(options);

      expect(searchClient.getRecommendations).toHaveBeenCalledWith([
        expect.objectContaining({
          fallbackParameters: customTags,
          queryParameters: customTags,
        }),
      ]);
    });

    test('returns recommendations', async () => {
      const options: SetupOptions<RelatedProductsConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createRecommendSearchClient(),
        },
        widgetParams: { objectIDs: ['1'] },
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
      const options: SetupOptions<RelatedProductsConnectorSetup> = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createRecommendSearchClient({
            minimal: true,
          }),
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
    test('does not recommend the input objectIDs', async () => {
      const searchClient = createSearchClient({
        getRecommendations: jest.fn((requests) =>
          Promise.resolve(
            createRecommendResponse(
              // @ts-ignore trending facets queries have no `objectID`
              requests.map((request: { objectID?: string }) =>
                createSingleSearchResponse({
                  hits:
                    request.objectID === '1'
                      ? [{ objectID: 'a' }, { objectID: '2' }]
                      : [{ objectID: '1' }, { objectID: 'c' }],
                })
              )
            )
          )
        ),
      });
      const options: SetupOptions<RelatedProductsConnectorSetup> = {
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: { objectIDs: ['1', '2'] },
      };

      await setup(options);

      await act(async () => {
        await wait(0);
      });

      expect(
        screen.getAllByRole('listitem').map((item) => item.textContent)
      ).toEqual(['a', 'c']);
    });
    test('attributes each recommendation to the queryID of the request that returned it', async () => {
      const searchClient = createSearchClient({
        getRecommendations: jest.fn((requests) =>
          Promise.resolve(
            createRecommendResponse(
              // @ts-ignore trending facets queries have no `objectID`
              requests.map((request: { objectID?: string }) =>
                createSingleSearchResponse(
                  request.objectID === '1'
                    ? {
                        queryID: 'q1',
                        hits: [{ objectID: 'a' }, { objectID: 'b' }],
                      }
                    : {
                        queryID: 'q2',
                        hits: [{ objectID: 'c' }, { objectID: 'a' }],
                      }
                )
              )
            )
          )
        ),
      });
      const options: SetupOptions<RelatedProductsConnectorSetup> = {
        instantSearchOptions: { indexName: 'indexName', searchClient },
        widgetParams: {
          objectIDs: ['1', '2'],
          transformItems(items) {
            return items.map((item) => ({
              ...item,
              objectID: `${item.objectID}:${item.__queryID}`,
            }));
          },
        },
      };

      await setup(options);

      await act(async () => {
        await wait(0);
      });

      expect(
        screen.getAllByRole('listitem').map((item) => item.textContent)
      ).toEqual(['a:q1', 'c:q2', 'b:q1']);
    });
  });
}
