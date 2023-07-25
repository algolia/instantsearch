import { SearchParameters, SearchResults } from 'algoliasearch-helper';

import connect from '../connectToggleRefinement';

jest.mock('../../core/createConnector', () => (x) => x);

const createSearchResults = ({ disjunctiveFacets, facets }) =>
  new SearchResults(
    new SearchParameters({
      disjunctiveFacets,
    }),
    [
      {
        facets,
        hits: [
          { objectID: '0123', name: 'Apple' },
          { objectID: '0123', name: 'Samsung' },
          { objectID: '0123', name: 'Microsoft' },
        ],
      },
    ]
  );

describe('connectToggleRefinement', () => {
  describe('single index', () => {
    const contextValue = { mainTargetedIndex: 'index' };
    const createSingleIndexSearchResults = (...args) => ({
      results: createSearchResults(...args),
    });

    it('expect `currentRefinement` to be `true` when the value is checked', () => {
      const props = { attribute: 'shipping', value: true, contextValue };
      const searchState = { toggle: { shipping: true } };
      const searchResults = {};

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.currentRefinement).toBe(true);
    });

    it('expect `currentRefinement` to be `false` when the value is not checked', () => {
      const props = { attribute: 'shipping', value: true, contextValue };
      const searchState = {};
      const searchResults = {};

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.currentRefinement).toBe(false);
    });

    it('expect `currentRefinement` to be `false` when searchState is a string considered falsy', () => {
      const props = { attribute: 'shipping', value: true, contextValue };
      const searchState = { toggle: { shipping: 'false' } };
      const searchResults = {};

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.currentRefinement).toBe(false);
    });

    it('expect `currentRefinement` to be `defaultRefinement`', () => {
      const props = {
        defaultRefinement: true,
        attribute: 'shipping',
        value: true,
        contextValue,
      };
      const searchState = {};
      const searchResults = {};

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.currentRefinement).toBe(true);
    });

    it('expect `canRefine` to be computed to `true` from all the facet values when the value is checked', () => {
      const props = { attribute: 'shipping', value: true, contextValue };
      const searchState = { toggle: { shipping: true } };
      const searchResults = createSingleIndexSearchResults({
        disjunctiveFacets: ['shipping'],
        facets: {
          shipping: {
            true: 100,
            false: 50,
          },
        },
      });

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.canRefine).toBe(true);
    });

    it('expect `canRefine` to be computed to `true` from the selected facet value when the value is not checked', () => {
      const props = { attribute: 'shipping', value: true, contextValue };
      const searchState = {};
      const searchResults = createSingleIndexSearchResults({
        disjunctiveFacets: ['shipping'],
        facets: {
          shipping: {
            true: 50,
            false: 100,
          },
        },
      });

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.canRefine).toBe(true);
    });

    it('expect `canRefine` to be `false` with a value count of 0', () => {
      const props = { attribute: 'shipping', value: true, contextValue };
      const searchState = {};
      const searchResults = createSingleIndexSearchResults({
        disjunctiveFacets: ['shipping'],
        facets: {
          shipping: {
            true: 0,
            false: 50,
          },
        },
      });

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.canRefine).toBe(false);
    });

    it('expect `canRefine` to be `false` without the facet values', () => {
      const props = { attribute: 'shipping', value: true, contextValue };
      const searchState = {};
      const searchResults = createSingleIndexSearchResults({
        disjunctiveFacets: ['shipping'],
        facets: {},
      });

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.canRefine).toBe(false);
    });

    it('expect `canRefine` to be `false` without the facet', () => {
      const props = { attribute: 'shipping', value: true, contextValue };
      const searchState = {};
      const searchResults = createSingleIndexSearchResults({
        disjunctiveFacets: [],
        facets: {},
      });

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.canRefine).toBe(false);
    });

    it('expect `canRefine` to be `false` without results', () => {
      const props = { attribute: 'shipping', value: true, contextValue };
      const searchState = {};
      const searchResults = {};

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.canRefine).toBe(false);
    });

    it('expect `count` to match facet values with results', () => {
      const props = { attribute: 'shipping', value: true, contextValue };
      const searchState = {};
      const searchResults = createSingleIndexSearchResults({
        disjunctiveFacets: ['shipping'],
        facets: {
          shipping: {
            true: 100,
            false: 50,
          },
        },
      });

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.count).toEqual({
        checked: 150,
        unchecked: 100,
      });
    });

    it('expect `count` to be null without the facet', () => {
      const props = { attribute: 'shipping', value: true, contextValue };
      const searchState = {};
      const searchResults = createSingleIndexSearchResults({
        disjunctiveFacets: ['shipping'],
        facets: {},
      });

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.count).toEqual({
        checked: null,
        unchecked: null,
      });
    });

    it('expect `count` to be null without results', () => {
      const props = { attribute: 'shipping', value: true, contextValue };
      const searchState = {};
      const searchResults = {};

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.count).toEqual({
        checked: null,
        unchecked: null,
      });
    });

    it("calling refine updates the widget's search state", () => {
      let searchState = connect.refine(
        { attribute: 't', contextValue },
        { otherKey: 'val', toggle: { otherKey: false } },
        true
      );
      expect(searchState).toEqual({
        otherKey: 'val',
        page: 1,
        toggle: { t: true, otherKey: false },
      });

      searchState = connect.refine(
        { attribute: 't', contextValue },
        { otherKey: 'val' },
        false
      );
      expect(searchState).toEqual({
        page: 1,
        otherKey: 'val',
        toggle: { t: false },
      });
    });

    it('refines the corresponding facet with `true`', () => {
      const params = connect.getSearchParameters(
        new SearchParameters(),
        {
          attribute: 'facet',
          value: 'val',
          contextValue,
        },
        {
          toggle: {
            facet: true,
          },
        }
      );

      expect(params.getDisjunctiveRefinements('facet')).toEqual(['val']);
    });

    it('does not refine the corresponding facet with `false`', () => {
      const params = connect.getSearchParameters(
        new SearchParameters(),
        {
          attribute: 'facet',
          value: 'val',
          contextValue,
        },
        {
          toggle: {
            facet: false,
          },
        }
      );

      expect(params.getDisjunctiveRefinements('facet')).toEqual([]);
    });

    it('applies the provided filter with `true`', () => {
      const params = connect.getSearchParameters(
        new SearchParameters(),
        {
          attribute: 'facet',
          filter: (sp) => sp.setQuery('yep'),
          contextValue,
        },
        {
          toggle: {
            facet: true,
          },
        }
      );

      expect(params.query).toEqual('yep');
    });

    it('does not apply the provided filter with `false`', () => {
      const params = connect.getSearchParameters(
        new SearchParameters(),
        {
          attribute: 'facet',
          filter: (sp) => sp.setQuery('yep'),
          contextValue,
        },
        {
          toggle: {
            facet: false,
          },
        }
      );

      expect(params.query).toBeUndefined();
    });

    it('registers its filter in metadata', () => {
      let metadata = connect.getMetadata({ attribute: 't', contextValue }, {});
      expect(metadata).toEqual({
        items: [],
        id: 't',
        index: 'index',
      });

      metadata = connect.getMetadata(
        { attribute: 't', label: 'yep', contextValue },
        { toggle: { t: true } }
      );
      expect(metadata).toEqual({
        items: [
          {
            label: 'yep',
            // Ignore clear, we test it later
            value: metadata.items[0].value,
            attribute: 't',
            currentRefinement: true,
          },
        ],
        id: 't',
        index: 'index',
      });
    });

    it('items value function should clear it from the search state', () => {
      const metadata = connect.getMetadata(
        { attribute: 'one', label: 'yep', contextValue },
        { toggle: { one: true, two: false } }
      );

      const searchState = metadata.items[0].value({
        toggle: { one: true, two: false },
      });

      expect(searchState).toEqual({
        page: 1,
        toggle: { one: false, two: false },
      });
    });

    it('should return the right searchState when clean up', () => {
      let searchState = connect.cleanUp(
        { attribute: 'name', contextValue },
        {
          toggle: { name: 'searchState', name2: 'searchState' },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        toggle: { name2: 'searchState' },
        another: { searchState: 'searchState' },
      });

      searchState = connect.cleanUp(
        { attribute: 'name2', contextValue },
        searchState
      );
      expect(searchState).toEqual({
        toggle: {},
        another: { searchState: 'searchState' },
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

    const createMultiIndexSearchResults = (...args) => ({
      results: {
        second: createSearchResults(...args),
      },
    });

    it('expect `currentRefinement` to be `true` when the value is checked', () => {
      const props = {
        attribute: 'shipping',
        value: true,
        contextValue,
        indexContextValue,
      };
      const searchState = createMultiIndexSearchState({
        toggle: { shipping: true },
      });
      const searchResults = {};

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.currentRefinement).toBe(true);
    });

    it('expect `currentRefinement` to be `false` when the value is not checked', () => {
      const props = {
        attribute: 'shipping',
        value: true,
        contextValue,
        indexContextValue,
      };
      const searchState = createMultiIndexSearchState();
      const searchResults = {};

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.currentRefinement).toBe(false);
    });

    it('expect `currentRefinement` to be `false` when searchState is a string considered falsy', () => {
      const props = {
        attribute: 'shipping',
        value: true,
        contextValue,
        indexContextValue,
      };
      const searchState = createMultiIndexSearchState({
        toggle: { shipping: 'false' },
      });
      const searchResults = {};

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.currentRefinement).toBe(false);
    });

    it('expect `currentRefinement` to be `defaultRefinement`', () => {
      const props = {
        defaultRefinement: true,
        attribute: 'shipping',
        value: true,
        contextValue,
        indexContextValue,
      };
      const searchState = createMultiIndexSearchState();
      const searchResults = {};

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.currentRefinement).toBe(true);
    });

    it('expect `canRefine` to be computed to `true` from all the facet values when the value is checked', () => {
      const props = {
        attribute: 'shipping',
        value: true,
        contextValue,
        indexContextValue,
      };
      const searchState = createMultiIndexSearchState({
        toggle: { shipping: true },
      });
      const searchResults = createMultiIndexSearchResults({
        disjunctiveFacets: ['shipping'],
        facets: {
          shipping: {
            true: 100,
            false: 50,
          },
        },
      });

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.canRefine).toBe(true);
    });

    it('expect `canRefine` to be computed to `true` from the selected facet value when the value is not checked', () => {
      const props = {
        attribute: 'shipping',
        value: true,
        contextValue,
        indexContextValue,
      };
      const searchState = createMultiIndexSearchState();
      const searchResults = createMultiIndexSearchResults({
        disjunctiveFacets: ['shipping'],
        facets: {
          shipping: {
            true: 50,
            false: 100,
          },
        },
      });

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.canRefine).toBe(true);
    });

    it('expect `canRefine` to be `false` with a value count of 0', () => {
      const props = {
        attribute: 'shipping',
        value: true,
        contextValue,
        indexContextValue,
      };
      const searchState = createMultiIndexSearchState();
      const searchResults = createMultiIndexSearchResults({
        disjunctiveFacets: ['shipping'],
        facets: {
          shipping: {
            true: 0,
            false: 50,
          },
        },
      });

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.canRefine).toBe(false);
    });

    it('expect `canRefine` to be `false` without the facet values', () => {
      const props = {
        attribute: 'shipping',
        value: true,
        contextValue,
        indexContextValue,
      };
      const searchState = createMultiIndexSearchState();
      const searchResults = createMultiIndexSearchResults({
        disjunctiveFacets: ['shipping'],
        facets: {},
      });

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.canRefine).toBe(false);
    });

    it('expect `canRefine` to be `false` without the facet', () => {
      const props = {
        attribute: 'shipping',
        value: true,
        contextValue,
        indexContextValue,
      };
      const searchState = createMultiIndexSearchState();
      const searchResults = createMultiIndexSearchResults({
        disjunctiveFacets: [],
        facets: {},
      });

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.canRefine).toBe(false);
    });

    it('expect `canRefine` to be `false` without results', () => {
      const props = {
        attribute: 'shipping',
        value: true,
        contextValue,
        indexContextValue,
      };
      const searchState = createMultiIndexSearchState();
      const searchResults = {};

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.canRefine).toBe(false);
    });

    it('expect `count` to match facet values with results', () => {
      const props = {
        attribute: 'shipping',
        value: true,
        contextValue,
        indexContextValue,
      };
      const searchState = createMultiIndexSearchState();
      const searchResults = createMultiIndexSearchResults({
        disjunctiveFacets: ['shipping'],
        facets: {
          shipping: {
            true: 100,
            false: 50,
          },
        },
      });

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.count).toEqual({
        checked: 150,
        unchecked: 100,
      });
    });

    it('expect `count` to be null without the facet', () => {
      const props = {
        attribute: 'shipping',
        value: true,
        contextValue,
        indexContextValue,
      };
      const searchState = createMultiIndexSearchState();
      const searchResults = createMultiIndexSearchResults({
        disjunctiveFacets: ['shipping'],
        facets: {},
      });

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.count).toEqual({
        checked: null,
        unchecked: null,
      });
    });

    it('expect `count` to be null without results', () => {
      const props = {
        attribute: 'shipping',
        value: true,
        contextValue,
        indexContextValue,
      };
      const searchState = createMultiIndexSearchState();
      const searchResults = {};

      const actual = connect.getProvidedProps(
        props,
        searchState,
        searchResults
      );

      expect(actual.count).toEqual({
        checked: null,
        unchecked: null,
      });
    });

    it("calling refine updates the widget's search state", () => {
      let searchState = connect.refine(
        { attribute: 't', contextValue, indexContextValue },
        {
          otherKey: 'val',
          indices: { second: { toggle: { otherKey: false } } },
        },
        true
      );
      expect(searchState).toEqual({
        otherKey: 'val',
        indices: { second: { page: 1, toggle: { t: true, otherKey: false } } },
      });

      searchState = connect.refine(
        {
          attribute: 't',
          contextValue: { mainTargetedIndex: 'first' },
          indexContextValue: { targetedIndex: 'first' },
        },
        { indices: { first: { toggle: { t: true, otherKey: false } } } },
        false
      );
      expect(searchState).toEqual({
        indices: {
          first: { page: 1, toggle: { t: false, otherKey: false } },
        },
      });
    });

    it('refines the corresponding facet with `true`', () => {
      const params = connect.getSearchParameters(
        new SearchParameters(),
        {
          attribute: 'facet',
          value: 'val',
          contextValue,
          indexContextValue,
        },
        {
          indices: {
            second: {
              toggle: {
                facet: true,
              },
            },
          },
        }
      );

      expect(params.getDisjunctiveRefinements('facet')).toEqual(['val']);
    });

    it('does not refine the corresponding facet with `false`', () => {
      const params = connect.getSearchParameters(
        new SearchParameters(),
        {
          attribute: 'facet',
          value: 'val',
          contextValue,
          indexContextValue,
        },
        {
          indices: {
            second: {
              toggle: {
                facet: false,
              },
            },
          },
        }
      );

      expect(params.getDisjunctiveRefinements('facet')).toEqual([]);
    });

    it('applies the provided filter with `true`', () => {
      const params = connect.getSearchParameters(
        new SearchParameters(),
        {
          attribute: 'facet',
          filter: (sp) => sp.setQuery('yep'),
          contextValue,
          indexContextValue,
        },
        {
          indices: {
            second: {
              toggle: {
                facet: true,
              },
            },
          },
        }
      );

      expect(params.query).toEqual('yep');
    });

    it('does not apply the provided filter with `false`', () => {
      const params = connect.getSearchParameters(
        new SearchParameters(),
        {
          attribute: 'facet',
          filter: (sp) => sp.setQuery('yep'),
          contextValue,
          indexContextValue,
        },
        {
          indices: {
            second: {
              toggle: {
                facet: false,
              },
            },
          },
        }
      );

      expect(params.query).toBeUndefined();
    });

    it('registers its filter in metadata', () => {
      const metadata = connect.getMetadata(
        { attribute: 't', label: 'yep', contextValue, indexContextValue },
        { indices: { second: { toggle: { t: true } } } }
      );
      expect(metadata).toEqual({
        items: [
          {
            label: 'yep',
            // Ignore clear, we test it later
            value: metadata.items[0].value,
            attribute: 't',
            currentRefinement: true,
          },
        ],
        id: 't',
        index: 'second',
      });
    });

    it('items value function should clear it from the search state', () => {
      const metadata = connect.getMetadata(
        { attribute: 'one', label: 'yep', contextValue, indexContextValue },
        { indices: { second: { toggle: { one: true, two: false } } } }
      );

      const searchState = metadata.items[0].value({
        indices: { second: { toggle: { one: true, two: false } } },
      });

      expect(searchState).toEqual({
        indices: { second: { page: 1, toggle: { one: false, two: false } } },
      });
    });

    it('should return the right searchState when clean up', () => {
      let searchState = connect.cleanUp(
        { attribute: 'name', contextValue, indexContextValue },
        {
          indices: {
            second: { toggle: { name: 'searchState', name2: 'searchState' } },
          },
          another: { searchState: 'searchState' },
        }
      );
      expect(searchState).toEqual({
        indices: { second: { toggle: { name2: 'searchState' } } },
        another: { searchState: 'searchState' },
      });

      searchState = connect.cleanUp(
        { attribute: 'name2', contextValue, indexContextValue },
        searchState
      );
      expect(searchState).toEqual({
        indices: { second: { toggle: {} } },
        another: { searchState: 'searchState' },
      });
    });
  });
});
