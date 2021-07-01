import { SearchResults, SearchParameters } from 'algoliasearch-helper';
import connector from '../connectDynamicWidgets';

jest.mock('../../core/createConnector', () => x => x);

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

  describe('single index', () => {
    const contextValue = {
      mainTargetedIndex: 'index',
    };

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
        const props = { contextValue, transformItems: items => items };
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
            facetOrdering: { facet: { order: ['one', 'two'] } },
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
          transformItems: jest.fn(items => items),
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
    });
  });

  describe('multi index', () => {
    const contextValue = { mainTargetedIndex: 'first' };
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
          transformItems: items => items,
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
          transformItems: items => items,
        };
        const searchState = createMultiIndexSearchState();
        const searchResults = createMultiIndexSearchResults({
          renderingContent: {
            facetOrdering: { facet: { order: ['one', 'two'] } },
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
          transformItems: jest.fn(items => items),
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
