import { SearchParameters } from 'algoliasearch-helper';

import connectConfigureRelatedItems from '../connectConfigureRelatedItems';

import type { PlainSearchParameters } from 'algoliasearch-helper';

jest.mock('../../core/createConnector', () => (x: any) => x);
const connect = connectConfigureRelatedItems as any;

const hit = {
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

describe('connectConfigure', () => {
  describe('single index', () => {
    const contextValue = { mainTargetedIndex: 'index' };
    const defaultProps = {
      transformSearchParameters: (x: PlainSearchParameters) => x,
      contextValue,
    };

    it('does not provide props', () => {
      const providedProps = connect.getProvidedProps({ contextValue }, null, {
        results: {},
      });

      expect(providedProps).toEqual({});
    });

    it('sets the optionalFilters search parameter based on matchingPatterns', () => {
      const searchParameters = connect.getSearchParameters.call(
        { contextValue },
        new SearchParameters(),
        {
          ...defaultProps,
          hit,
          matchingPatterns: {
            brand: { score: 3 },
            categories: { score: 2 },
          },
        }
      );

      expect(searchParameters).toEqual(
        expect.objectContaining({
          facetFilters: ['objectID:-1'],
          sumOrFiltersScores: true,
          optionalFilters: [
            'brand:Amazon<score=3>',
            [
              'categories:TV & Home Theater<score=2>',
              'categories:Streaming Media Players<score=2>',
            ],
          ],
        })
      );
    });

    it('sets the optionalFilters search parameter based on matchingPatterns with nested attributes', () => {
      const searchParameters = connect.getSearchParameters.call(
        { contextValue },
        new SearchParameters(),
        {
          ...defaultProps,
          hit,
          matchingPatterns: {
            brand: { score: 3 },
            'hierarchicalCategories.lvl0': { score: 2 },
          },
        }
      );

      expect(searchParameters).toEqual(
        expect.objectContaining({
          facetFilters: ['objectID:-1'],
          sumOrFiltersScores: true,
          optionalFilters: [
            'brand:Amazon<score=3>',
            'hierarchicalCategories.lvl0:TV & Home Theater<score=2>',
          ],
        })
      );
    });

    it('sets transformed search parameters based on transformSearchParameters', () => {
      const searchParameters = connect.getSearchParameters.call(
        { contextValue },
        new SearchParameters(),
        {
          ...defaultProps,
          hit,
          matchingPatterns: {
            brand: { score: 3 },
            categories: { score: 2 },
          },
          transformSearchParameters(parameters: PlainSearchParameters) {
            return {
              ...parameters,
              optionalWords: hit.name.split(' '),
            };
          },
        }
      );

      expect(searchParameters).toEqual(
        expect.objectContaining({
          facetFilters: ['objectID:-1'],
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
        })
      );
    });

    it('filters out and warns for incorrect optionalFilters value type', () => {
      // We need to simulate being in development mode and to mock the global console object
      // in this test to assert that development warnings are displayed correctly.
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const searchParameters = connect.getSearchParameters.call(
        { contextValue },
        new SearchParameters(),
        {
          ...defaultProps,
          hit,
          matchingPatterns: {
            rating: { score: 1 }, // `rating` is a number, which is not supported by the `optionalFilters` API
            brand: { score: 3 },
            categories: { score: 2 },
          },
        }
      );

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        'The `matchingPatterns` option returned a value of type Number for the "rating" key. This value was not sent to Algolia because `optionalFilters` only supports strings and array of strings.\n\n' +
          'You can remove the "rating" key from the `matchingPatterns` option.\n\n' +
          'See https://www.algolia.com/doc/api-reference/api-parameters/optionalFilters/'
      );

      expect(searchParameters).toEqual(
        expect.objectContaining({
          facetFilters: ['objectID:-1'],
          sumOrFiltersScores: true,
          optionalFilters: [
            'brand:Amazon<score=3>',
            [
              'categories:TV & Home Theater<score=2>',
              'categories:Streaming Media Players<score=2>',
            ],
          ],
        })
      );

      process.env.NODE_ENV = originalNodeEnv;
      warnSpy.mockRestore();
    });

    it('calling transitionState should add configure parameters to the search state', () => {
      const instance = {};

      let searchState = connect.transitionState.call(
        instance,
        {
          ...defaultProps,
          hit,
          matchingPatterns: {
            brand: { score: 3 },
            categories: { score: 2 },
          },
        },
        {},
        {}
      );

      expect(searchState).toEqual({
        configure: {
          facetFilters: ['objectID:-1'],
          sumOrFiltersScores: true,
          optionalFilters: [
            'brand:Amazon<score=3>',
            [
              'categories:TV & Home Theater<score=2>',
              'categories:Streaming Media Players<score=2>',
            ],
          ],
        },
      });

      searchState = connect.transitionState.call(
        instance,
        {
          ...defaultProps,
          hit,
          matchingPatterns: {
            brand: { score: 3 },
          },
        },
        { configure: { facets: ['categories'] } },
        { configure: { facets: ['categories'] } }
      );

      expect(searchState).toEqual({
        configure: {
          facetFilters: ['objectID:-1'],
          sumOrFiltersScores: true,
          optionalFilters: ['brand:Amazon<score=3>'],
          facets: ['categories'],
        },
      });
    });

    it('calling cleanUp should remove configure parameters from the search state', () => {
      const instance = {};

      // Running `transitionState` allows to set previous search parameters
      // in the connector state.
      let searchState = connect.transitionState.call(
        instance,
        {
          ...defaultProps,
          hit,
          matchingPatterns: {
            brand: { score: 3 },
            categories: { score: 2 },
          },
        },
        {},
        {}
      );

      searchState = connect.cleanUp.call(
        instance,
        {
          ...defaultProps,
          hit,
          matchingPatterns: {
            brand: { score: 3 },
            categories: { score: 2 },
          },
        },
        {
          configure: {
            facetFilters: ['objectID:-1'],
            sumOrFiltersScores: true,
            optionalFilters: ['brand:Amazon<score=3>'],
            facets: ['categories'],
          },
        }
      );

      expect(searchState).toEqual({
        configure: {
          facets: ['categories'],
        },
      });

      searchState = connect.cleanUp.call(
        instance,
        {
          ...defaultProps,
          hit,
          matchingPatterns: {
            brand: { score: 3 },
            categories: { score: 2 },
          },
        },
        {
          configure: {
            facetFilters: ['objectID:-1'],
            sumOrFiltersScores: true,
            optionalFilters: ['brand:Amazon<score=3>'],
          },
        }
      );

      expect(searchState).toEqual({ configure: {} });
    });
  });

  describe('multi index', () => {
    const contextValue = { mainTargetedIndex: 'first' };
    const indexContextValue = { targetedIndex: 'second' };
    const defaultProps = {
      transformSearchParameters: (x: PlainSearchParameters) => x,
      contextValue,
      indexContextValue,
    };

    it('does not provide props', () => {
      const providedProps = connect.getProvidedProps({ contextValue }, null, {
        results: {},
      });

      expect(providedProps).toEqual({});
    });

    it('sets the optionalFilters search parameter based on matchingPatterns', () => {
      const searchParameters = connect.getSearchParameters.call(
        { contextValue },
        new SearchParameters(),
        {
          ...defaultProps,
          hit,
          matchingPatterns: {
            brand: { score: 3 },
            categories: { score: 2 },
          },
        }
      );

      expect(searchParameters).toEqual(
        expect.objectContaining({
          facetFilters: ['objectID:-1'],
          sumOrFiltersScores: true,
          optionalFilters: [
            'brand:Amazon<score=3>',
            [
              'categories:TV & Home Theater<score=2>',
              'categories:Streaming Media Players<score=2>',
            ],
          ],
        })
      );
    });

    it('sets transformed search parameters based on transformSearchParameters', () => {
      const searchParameters = connect.getSearchParameters.call(
        { contextValue },
        new SearchParameters(),
        {
          ...defaultProps,
          hit,
          matchingPatterns: {
            brand: { score: 3 },
            categories: { score: 2 },
          },
          transformSearchParameters(parameters: PlainSearchParameters) {
            return {
              ...parameters,
              optionalWords: hit.name.split(' '),
            };
          },
        }
      );

      expect(searchParameters).toEqual(
        expect.objectContaining({
          facetFilters: ['objectID:-1'],
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
        })
      );
    });

    it('filters out and warns for incorrect optionalFilters value type', () => {
      // We need to simulate being in development mode and to mock the global console object
      // in this test to assert that development warnings are displayed correctly.
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const searchParameters = connect.getSearchParameters.call(
        { contextValue },
        new SearchParameters(),
        {
          ...defaultProps,
          hit,
          matchingPatterns: {
            rating: { score: 1 }, // `rating` is a number, which is not supported by the `optionalFilters` API
            brand: { score: 3 },
            categories: { score: 2 },
          },
        }
      );

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        'The `matchingPatterns` option returned a value of type Number for the "rating" key. This value was not sent to Algolia because `optionalFilters` only supports strings and array of strings.\n\n' +
          'You can remove the "rating" key from the `matchingPatterns` option.\n\n' +
          'See https://www.algolia.com/doc/api-reference/api-parameters/optionalFilters/'
      );

      expect(searchParameters).toEqual(
        expect.objectContaining({
          facetFilters: ['objectID:-1'],
          sumOrFiltersScores: true,
          optionalFilters: [
            'brand:Amazon<score=3>',
            [
              'categories:TV & Home Theater<score=2>',
              'categories:Streaming Media Players<score=2>',
            ],
          ],
        })
      );

      process.env.NODE_ENV = originalNodeEnv;
      warnSpy.mockRestore();
    });

    it('calling transitionState should add configure parameters to the search state', () => {
      const instance = {};

      const searchState = connect.transitionState.call(
        instance,
        {
          ...defaultProps,
          hit,
          matchingPatterns: {
            brand: { score: 3 },
            categories: { score: 2 },
          },
        },
        {},
        {}
      );

      expect(searchState).toEqual({
        indices: {
          second: {
            configure: {
              facetFilters: ['objectID:-1'],
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
        },
      });
    });

    it('calling cleanUp should remove configure parameters from the search state', () => {
      const instance = {};

      // Running `transitionState` allows to set previous search parameters
      // in the connector state.
      let searchState = connect.transitionState.call(
        instance,
        {
          ...defaultProps,
          hit,
          matchingPatterns: {
            brand: { score: 3 },
            categories: { score: 2 },
          },
        },
        {},
        {}
      );

      searchState = connect.cleanUp.call(
        instance,
        {
          ...defaultProps,
          hit,
          matchingPatterns: {
            brand: { score: 3 },
            categories: { score: 2 },
          },
        },
        {
          indices: {
            second: {
              configure: {
                facetFilters: ['objectID:-1'],
                sumOrFiltersScores: true,
                optionalFilters: ['brand:Amazon<score=3>'],
                facets: ['categories'],
              },
            },
          },
        }
      );

      expect(searchState).toEqual({
        indices: {
          second: {
            configure: {
              facets: ['categories'],
            },
          },
        },
      });

      searchState = connect.cleanUp.call(
        instance,
        {
          ...defaultProps,
          hit,
          matchingPatterns: {
            brand: { score: 3 },
            categories: { score: 2 },
          },
        },
        {
          indices: {
            second: {
              configure: {
                facetFilters: ['objectID:-1'],
                sumOrFiltersScores: true,
                optionalFilters: ['brand:Amazon<score=3>'],
              },
            },
          },
        }
      );

      expect(searchState).toEqual({ indices: { second: { configure: {} } } });
    });
  });
});
