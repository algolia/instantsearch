import connectConfigureRelatedItems from '../connectConfigureRelatedItems';
import instantsearch from '../../../lib/main';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { AlgoliaHit } from '../../../types';
import { noop } from '../../../lib/utils';

const hit: AlgoliaHit = {
  objectID: '1',
  name: 'Amazon - Fire TV Stick with Alexa Voice Remote - Black',
  description:
    'Enjoy smart access to videos, games and apps with this Amazon Fire TV stick.',
  brand: 'Amazon',
  categories: ['TV & Home Theater', 'Streaming Media Players'],
  hierarchicalCategories: {
    lvl0: 'TV & Home Theater',
    lvl1: 'TV & Home Theater > Streaming Media Players',
  },
  price: 39.99,
  free_shipping: false,
  rating: 4,
  _snippetResult: {
    description: {
      value:
        'Enjoy smart access to videos, games and apps with this Amazon Fire TV stick. Its […]',
      matchLevel: 'none',
    },
  },
  _highlightResult: {
    description: {
      value:
        'Enjoy smart access to videos, games and apps with this Amazon Fire TV stick. Its […]',
      matchLevel: 'none',
      matchedWords: [],
    },
  },
};

describe('connectConfigureRelatedItems', () => {
  describe('usage', () => {
    test('throws without hit option', () => {
      const configureRelatedItems = connectConfigureRelatedItems(noop);

      expect(() => {
        // @ts-ignore missing options
        configureRelatedItems();
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`hit\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/configure-related-items/js/#connector"
`);
    });

    test('throws without matchingPatterns option', () => {
      const configureRelatedItems = connectConfigureRelatedItems(noop);

      expect(() => {
        // @ts-ignore missing options
        configureRelatedItems({
          hit,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`matchingPatterns\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/configure-related-items/js/#connector"
`);
    });

    test('does not throw on correct usage', () => {
      const configureRelatedItems = connectConfigureRelatedItems(noop);

      expect(() => {
        configureRelatedItems({
          hit,
          matchingPatterns: {},
        });
      }).not.toThrow();
    });

    test('is a widget', () => {
      const configureRelatedItems = connectConfigureRelatedItems(noop);
      const widget = configureRelatedItems({
        hit,
        matchingPatterns: {},
      });

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.configureRelatedItems',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
          getWidgetSearchParameters: expect.any(Function),
          getWidgetUiState: expect.any(Function),
        })
      );
    });
  });

  describe('options', () => {
    test('sets the optionalFilters search parameter based on matchingPatterns', () => {
      const searchClient = createSearchClient();
      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });
      const configureRelatedItems = connectConfigureRelatedItems(noop);

      search.addWidgets([
        configureRelatedItems({
          hit,
          matchingPatterns: {
            brand: { score: 3 },
            categories: { score: 2 },
          },
        }),
      ]);
      search.start();

      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenCalledWith([
        {
          indexName: 'indexName',
          params: {
            facets: [],
            facetFilters: ['objectID:-1'],
            tagFilters: '',
            sumOrFiltersScores: true,
            optionalFilters: [
              'brand:Amazon<score=3>',
              [
                'categories:TV & Home Theater<score=2>',
                'categories:Streaming Media Players<score=2>',
              ],
            ],
          },
        },
      ]);
    });

    test('sets the optionalFilters search parameter based on matchingPatterns with nested attributes', () => {
      const searchClient = createSearchClient();
      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });
      const configureRelatedItems = connectConfigureRelatedItems(noop);

      search.addWidgets([
        configureRelatedItems({
          hit,
          matchingPatterns: {
            brand: { score: 3 },
            'hierarchicalCategories.lvl0': { score: 2 },
          },
        }),
      ]);
      search.start();

      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenCalledWith([
        {
          indexName: 'indexName',
          params: {
            facets: [],
            facetFilters: ['objectID:-1'],
            tagFilters: '',
            sumOrFiltersScores: true,
            optionalFilters: [
              'brand:Amazon<score=3>',
              'hierarchicalCategories.lvl0:TV & Home Theater<score=2>',
            ],
          },
        },
      ]);
    });

    test('sets transformed search parameters based on transformSearchParameters', () => {
      const searchClient = createSearchClient();
      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });
      const configureRelatedItems = connectConfigureRelatedItems(noop);

      search.addWidgets([
        configureRelatedItems({
          hit,
          matchingPatterns: {
            brand: { score: 3 },
            categories: { score: 2 },
          },
          transformSearchParameters(searchParameters) {
            return {
              ...searchParameters,
              optionalWords: hit.name.split(' '),
            };
          },
        }),
      ]);
      search.start();

      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenCalledWith([
        {
          indexName: 'indexName',
          params: {
            facets: [],
            facetFilters: ['objectID:-1'],
            tagFilters: '',
            sumOrFiltersScores: true,
            optionalFilters: [
              'brand:Amazon<score=3>',
              [
                'categories:TV & Home Theater<score=2>',
                'categories:Streaming Media Players<score=2>',
              ],
            ],
            optionalWords: [
              'Amazon',
              '-',
              'Fire',
              'TV',
              'Stick',
              'with',
              'Alexa',
              'Voice',
              'Remote',
              '-',
              'Black',
            ],
          },
        },
      ]);
    });

    test('filter out and warns for incorrect optionalFilters value type', () => {
      const searchClient = createSearchClient();
      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });
      const configureRelatedItems = connectConfigureRelatedItems(noop);

      expect(() => {
        search.addWidgets([
          configureRelatedItems({
            hit,
            matchingPatterns: {
              rating: { score: 1 }, // `rating` is a number, which is not supported by the `optionalFilters` API
              brand: { score: 3 },
              categories: { score: 1 },
            },
          }),
        ]);
      })
        .toWarnDev(`[InstantSearch.js]: The \`matchingPatterns\` option returned a value of type Number for the "rating" key. This value was not sent to Algolia because \`optionalFilters\` only supports strings and array of strings.

You can remove the "rating" key from the \`matchingPatterns\` option.

See https://www.algolia.com/doc/api-reference/api-parameters/optionalFilters/`);
      search.start();

      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenCalledWith([
        {
          indexName: 'indexName',
          params: {
            facets: [],
            facetFilters: ['objectID:-1'],
            tagFilters: '',
            sumOrFiltersScores: true,
            optionalFilters: [
              'brand:Amazon<score=3>',
              [
                'categories:TV & Home Theater<score=1>',
                'categories:Streaming Media Players<score=1>',
              ],
            ],
          },
        },
      ]);
    });
  });
});
