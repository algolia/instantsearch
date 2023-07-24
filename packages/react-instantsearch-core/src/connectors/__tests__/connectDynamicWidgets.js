import { SearchResults, SearchParameters } from 'algoliasearch-helper';

import connector from '../connectDynamicWidgets';

jest.mock('../../core/createConnector', () => (x) => x);

const EMPTY_RESPONSE = {
  results: [
    {
      hits: [],
      nbHits: 0,
      page: 0,
      nbPages: 0,
      hitsPerPage: 20,
      exhaustiveNbHits: true,
      query: '',
      queryAfterRemoval: '',
      params:
        'highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&query=&facets=%5B%5D&tagFilters=',
      index: 'instant_search',
      processingTimeMS: 2,
    },
  ],
};

describe('connectDynamicWidgets', () => {
  const empty = {};
  const contextValue = {
    mainTargetedIndex: 'index',
  };

  describe('getSearchParameters', () => {
    it('sets facets * and maxValuesPerFacet by default', () => {
      const props = {
        contextValue,
        ...connector.defaultProps,
      };
      const searchState = {};

      const actual = connector.getSearchParameters(
        new SearchParameters(),
        props,
        searchState
      );

      expect(actual).toEqual(
        new SearchParameters({
          facets: ['*'],
          maxValuesPerFacet: 20,
        })
      );
    });

    it('gets added onto existing parameters', () => {
      const props = {
        contextValue,
        ...connector.defaultProps,
      };
      const searchState = {};

      const actual = connector.getSearchParameters(
        new SearchParameters({
          facets: ['123'],
          maxValuesPerFacet: 1000,
        }),
        props,
        searchState
      );

      expect(actual).toEqual(
        new SearchParameters({
          facets: ['123', '*'],
          maxValuesPerFacet: 1000,
        })
      );
    });

    it('allows override of facets and maxValuesPerFacet', () => {
      const props = {
        contextValue,
        ...connector.defaultProps,
        facets: ['lol'],
        maxValuesPerFacet: 1000,
      };
      const searchState = {};

      const actual = connector.getSearchParameters(
        new SearchParameters(),
        props,
        searchState
      );

      expect(actual).toEqual(
        new SearchParameters({
          facets: ['lol'],
          maxValuesPerFacet: 1000,
        })
      );
    });
  });

  describe('single index', () => {
    const createSingleIndexSearchResults = (result = {}, state) => ({
      results: new SearchResults(new SearchParameters(state), [
        {
          ...EMPTY_RESPONSE.results[0],
          ...result,
        },
      ]),
    });

    describe('getProvidedProps', () => {
      it('empty results', () => {
        const props = { contextValue };
        const searchState = {};
        const searchResults = empty;

        const actual = connector.getProvidedProps(
          props,
          searchState,
          searchResults
        );

        const expectation = {
          attributesToRender: [],
        };

        expect(actual).toEqual(expectation);
      });

      it('attributesToRender is the return value of transformItems', () => {
        const returnValue = ['test1', 'test2'];
        const props = { contextValue, transformItems: () => returnValue };
        const searchState = {};
        const searchResults = createSingleIndexSearchResults();

        const actual = connector.getProvidedProps(
          props,
          searchState,
          searchResults
        );

        expect(actual.attributesToRender).toEqual(returnValue);
      });

      it('default items is []', () => {
        const props = { contextValue, transformItems: (items) => items };
        const searchState = {};
        const searchResults = createSingleIndexSearchResults();

        const actual = connector.getProvidedProps(
          props,
          searchState,
          searchResults
        );

        expect(actual.attributesToRender).toEqual([]);
      });

      it('reads from facetOrdering by default', () => {
        const props = {
          contextValue,
          ...connector.defaultProps,
        };
        const searchState = {};
        const searchResults = createSingleIndexSearchResults({
          renderingContent: {
            facetOrdering: { facets: { order: ['one', 'two'] } },
          },
        });

        const actual = connector.getProvidedProps(
          props,
          searchState,
          searchResults
        );

        expect(actual.attributesToRender).toEqual(['one', 'two']);
      });

      it('transformItems gets called with results', () => {
        const props = {
          contextValue,
          transformItems: jest.fn((items) => items),
        };
        const searchState = {};
        const searchResults = createSingleIndexSearchResults({
          userData: [{ MOCK_FACET_ORDER: ['one', 'two'] }],
        });

        const actual = connector.getProvidedProps(
          props,
          searchState,
          searchResults
        );

        expect(props.transformItems).toHaveBeenCalledTimes(1);
        expect(props.transformItems).toHaveBeenCalledWith([], {
          results: searchResults.results,
        });

        expect(actual.attributesToRender).toEqual([]);
      });

      it('userData is usable as a source for transformItems', () => {
        const props = {
          contextValue,
          transformItems: (_items, { results }) =>
            results.userData[0].MOCK_FACET_ORDER,
        };
        const searchState = {};
        const searchResults = createSingleIndexSearchResults({
          userData: [{ MOCK_FACET_ORDER: ['one', 'two'] }],
        });

        const actual = connector.getProvidedProps(
          props,
          searchState,
          searchResults
        );

        expect(actual.attributesToRender).toEqual(['one', 'two']);
      });

      it('fails when a non-star facet is given', () => {
        const props = {
          contextValue,
          ...connector.defaultProps,
          facets: ['lol'],
        };
        const searchState = {};
        const searchResults = createSingleIndexSearchResults({});

        expect(() =>
          connector.getProvidedProps(props, searchState, searchResults)
        ).toThrowErrorMatchingInlineSnapshot(
          `"The \`facets\` prop only accepts [] or [\\"*\\"], you passed [\\"lol\\"]"`
        );
      });

      it('fails when a multiple star facets are given', () => {
        const props = {
          contextValue,
          ...connector.defaultProps,
          facets: ['*', '*'],
        };
        const searchState = {};
        const searchResults = createSingleIndexSearchResults({});

        expect(() =>
          connector.getProvidedProps(props, searchState, searchResults)
        ).toThrowErrorMatchingInlineSnapshot(
          `"The \`facets\` prop only accepts [] or [\\"*\\"], you passed [\\"*\\",\\"*\\"]"`
        );
      });

      it('does not fail when only star facet is given', () => {
        const props = {
          contextValue,
          ...connector.defaultProps,
          facets: ['*'],
        };
        const searchState = {};
        const searchResults = createSingleIndexSearchResults({});

        expect(() =>
          connector.getProvidedProps(props, searchState, searchResults)
        ).not.toThrow();
      });

      it('does not fail when no facet is given', () => {
        const props = {
          contextValue,
          ...connector.defaultProps,
          facets: [],
        };
        const searchState = {};
        const searchResults = createSingleIndexSearchResults({});

        expect(() =>
          connector.getProvidedProps(props, searchState, searchResults)
        ).not.toThrow();
      });

      it('warns if maxValuesPerFacet is lower than set by another widget', () => {
        const spy = jest.spyOn(console, 'warn');
        const props = {
          contextValue,
          ...connector.defaultProps,
        };
        const searchState = {};
        const searchResults = createSingleIndexSearchResults(
          {},
          new SearchParameters({ maxValuesPerFacet: 100 })
        );

        connector.getProvidedProps(props, searchState, searchResults);

        expect(spy).toHaveBeenCalledWith(
          'The maxValuesPerFacet set by dynamic widgets (20) is smaller than one of the limits set by a widget (100). This causes a mismatch in query parameters and thus an extra network request when that widget is mounted.'
        );
      });

      it('warns if >20 facets are displayed due to implicit *', () => {
        const spy = jest.spyOn(console, 'warn');
        const props = {
          contextValue,
          transformItems: (_items, { results }) =>
            results.userData[0].MOCK_FACET_ORDER,
        };
        const searchState = {};
        const searchResults = createSingleIndexSearchResults({
          userData: [
            {
              MOCK_FACET_ORDER: Array.from(
                { length: 21 },
                (_, i) => `item${i}`
              ),
            },
          ],
        });

        const actual = connector.getProvidedProps(
          props,
          searchState,
          searchResults
        );

        expect(spy).toHaveBeenCalledWith(
          'More than 20 facets are requested to be displayed without explicitly setting which facets to retrieve. This could have a performance impact. Set "facets" to [] to do two smaller network requests, or explicitly to [\'*\'] to avoid this warning.'
        );

        expect(actual.attributesToRender).toEqual([
          'item0',
          'item1',
          'item2',
          'item3',
          'item4',
          'item5',
          'item6',
          'item7',
          'item8',
          'item9',
          'item10',
          'item11',
          'item12',
          'item13',
          'item14',
          'item15',
          'item16',
          'item17',
          'item18',
          'item19',
          'item20',
        ]);
      });
    });
  });

  describe('multi index', () => {
    const indexContextValue = { targetedIndex: 'second' };

    const createMultiIndexSearchState = (state = {}) => ({
      indices: {
        second: state,
      },
    });

    const createMultiIndexSearchResults = (result = {}, state) => ({
      results: {
        second: new SearchResults(new SearchParameters(state), [
          {
            ...EMPTY_RESPONSE.results[0],
            ...result,
          },
        ]),
      },
    });

    describe('getProvidedProps', () => {
      it('empty results', () => {
        const searchState = createMultiIndexSearchState();
        const props = { contextValue, indexContextValue };

        const searchResults = empty;

        const actual = connector.getProvidedProps(
          props,
          searchState,
          searchResults
        );

        const expectation = {
          attributesToRender: [],
        };

        expect(actual).toEqual(expectation);
      });

      it('attributesToRender is the return value of transformItems', () => {
        const returnValue = ['one', 'two'];
        const props = {
          contextValue,
          indexContextValue,
          transformItems: () => returnValue,
        };
        const searchState = createMultiIndexSearchState();
        const searchResults = createMultiIndexSearchResults();

        const actual = connector.getProvidedProps(
          props,
          searchState,
          searchResults
        );

        expect(actual.attributesToRender).toEqual(returnValue);
      });

      it('default items is []', () => {
        const props = {
          contextValue,
          indexContextValue,
          transformItems: (items) => items,
        };
        const searchState = createMultiIndexSearchState();
        const searchResults = createMultiIndexSearchResults();

        const actual = connector.getProvidedProps(
          props,
          searchState,
          searchResults
        );

        expect(actual.attributesToRender).toEqual([]);
      });

      it('reads from facetOrdering by default', () => {
        const props = {
          contextValue,
          indexContextValue,
          transformItems: (items) => items,
        };
        const searchState = createMultiIndexSearchState();
        const searchResults = createMultiIndexSearchResults({
          renderingContent: {
            facetOrdering: { facets: { order: ['one', 'two'] } },
          },
        });

        const actual = connector.getProvidedProps(
          props,
          searchState,
          searchResults
        );

        expect(actual.attributesToRender).toEqual(['one', 'two']);
      });

      it('transformItems gets called with results', () => {
        const props = {
          contextValue,
          indexContextValue,
          transformItems: jest.fn((items) => items),
        };
        const searchState = createMultiIndexSearchState();
        const searchResults = createMultiIndexSearchResults();

        const actual = connector.getProvidedProps(
          props,
          searchState,
          searchResults
        );

        expect(props.transformItems).toHaveBeenCalledTimes(1);
        expect(props.transformItems).toHaveBeenCalledWith([], {
          results: searchResults.results.second,
        });

        expect(actual.attributesToRender).toEqual([]);
      });

      it('userData is usable as a source for transformItems', () => {
        const props = {
          contextValue,
          indexContextValue,
          transformItems: (_items, { results }) =>
            results.userData[0].MOCK_FACET_ORDER,
        };
        const searchState = createMultiIndexSearchState();
        const searchResults = createMultiIndexSearchResults({
          userData: [{ MOCK_FACET_ORDER: ['one', 'two'] }],
        });

        const actual = connector.getProvidedProps(
          props,
          searchState,
          searchResults
        );

        expect(actual.attributesToRender).toEqual(['one', 'two']);
      });
    });
  });
});
