/* eslint-env jest, jasmine */

import {SearchParameters, SearchResults} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import facetRefiner from './facetRefiner';
jest.unmock('./facetRefiner');
import {assertFacetDefined} from '../utils';

const {
  configure,
  mapStateToProps,
  transformProps,
  refine,
} = facetRefiner;

describe('facetRefiner', () => {
  it('increases maxValuesPerFacet when it isn\'t big enough', () => {
    let state;
    let configuredState;

    state = new SearchParameters({maxValuesPerFacet: 100});
    configuredState = configure(state, {
      limit: 101,
      facetType: 'conjunctive',
    });
    expect(configuredState.maxValuesPerFacet).toBe(101);

    state = new SearchParameters({maxValuesPerFacet: 101});
    configuredState = configure(state, {
      limit: 100,
      facetType: 'conjunctive',
    });
    expect(configuredState.maxValuesPerFacet).toBe(101);
  });

  it('adds the required facet or disjunctiveFacet', () => {
    let state;
    let configuredState;

    state = new SearchParameters();
    configuredState = configure(state, {
      facetType: 'disjunctive',
      attributeName: 'foo',
    });
    expect(configuredState.disjunctiveFacets).toEqual(['foo']);

    state = new SearchParameters({disjunctiveFacets: ['foo']});
    configuredState = configure(state, {
      facetType: 'disjunctive',
      attributeName: 'foo',
    });
    expect(configuredState.disjunctiveFacets).toEqual(['foo']);

    state = new SearchParameters();
    configuredState = configure(state, {
      facetType: 'conjunctive',
      attributeName: 'foo',
    });
    expect(configuredState.facets).toEqual(['foo']);

    state = new SearchParameters({facets: ['foo']});
    configuredState = configure(state, {
      facetType: 'conjunctive',
      attributeName: 'foo',
    });
    expect(configuredState.facets).toEqual(['foo']);
  });

  it('provides the correct props to the component', () => {
    function testFacetType(facetType) {
      let props;
      let searchParameters;
      let result;

      const key = facetType === 'disjunctive' ? 'disjunctiveFacets' : 'facets';
      const addMethodKey = facetType === 'disjunctive' ?
        'addDisjunctiveFacetRefinement' :
        'addFacetRefinement';

      props = mapStateToProps({
        searchParameters: new SearchParameters({
          [key]: ['foo'],
        }),
        searchResults: null,
      }, {
        attributeName: 'foo',
        facetType,
      });
      expect(props).toEqual({facetValues: null, selectedItems: []});

      props = mapStateToProps({
        searchParameters: new SearchParameters({
          [key]: ['foo'],
        })[addMethodKey]('foo', 'bar'),
        searchResults: null,
      }, {
        attributeName: 'foo',
        facetType,
      });
      expect(props).toEqual({facetValues: null, selectedItems: ['bar']});

      searchParameters = new SearchParameters({
        [key]: ['foo'],
      })[addMethodKey]('foo', 'bar');
      result = {
        facets: {
          foo: {
            bar: 100,
          },
        },
      };
      props = mapStateToProps({
        searchParameters,
        searchResultsSearchParameters: searchParameters,
        searchResults: new SearchResults(searchParameters, {
          results: [result, result],
        }),
      }, {
        attributeName: 'foo',
        facetType,
      });
      expect(props).toEqual({
        facetValues: [{
          name: 'bar',
          count: 100,
          isRefined: true,
        }],
        selectedItems: ['bar'],
      });

      searchParameters = new SearchParameters({
        [key]: ['foo'],
      })[addMethodKey]('foo', 'bar');
      result = {
        facets: {
          foo: {
            bar: 100,
            foobar: 200,
          },
        },
      };
      props = mapStateToProps({
        searchParameters,
        searchResultsSearchParameters: searchParameters,
        searchResults: new SearchResults(searchParameters, {
          results: [result, result],
        }),
      }, {
        attributeName: 'foo',
        facetType,
      });
      expect(props).toEqual({
        facetValues: [
          {
            name: 'bar',
            count: 100,
            isRefined: true,
          },
          {
            name: 'foobar',
            count: 200,
            isRefined: false,
          },
        ],
        selectedItems: ['bar'],
      });

      props = mapStateToProps({
        searchParameters,
        searchResultsSearchParameters: searchParameters,
        searchResults: new SearchResults(searchParameters, {
          results: [result, result],
        }),
      }, {
        attributeName: 'foo',
        sortBy: ['count:desc'],
        facetType,
      });
      expect(props).toEqual({
        facetValues: [
          {
            name: 'foobar',
            count: 200,
            isRefined: false,
          },
          {
            name: 'bar',
            count: 100,
            isRefined: true,
          },
        ],
        selectedItems: ['bar'],
      });
    }

    testFacetType('disjunctive');
    testFacetType('conjunctive');
  });

  it('asserts the facet is defined', () => {
    assertFacetDefined.mockClear();
    const searchParameters = new SearchParameters({
      disjunctiveFacets: ['facet'],
    });
    const searchResults = new SearchResults(searchParameters, {
      results: [{}],
    });
    mapStateToProps({
      searchParameters,
      searchResultsSearchParameters: searchParameters,
      searchResults,
    }, {
      facetType: 'disjunctive',
      attributeName: 'facet',
    });
    expect(assertFacetDefined.mock.calls.length).toBe(1);
    expect(assertFacetDefined.mock.calls[0][0]).toBe(searchParameters);
    expect(assertFacetDefined.mock.calls[0][1]).toBe(searchResults);
    expect(assertFacetDefined.mock.calls[0][2]).toBe('facet');
  });

  it('transforms its props', () => {
    expect(transformProps({
      facetValues: null,
      limit: 1,
    })).toEqual({});

    expect(transformProps({
      facetValues: [{
        name: 'foo',
        count: 100,
        isRefined: false,
      }],
      limit: 1,
    })).toEqual({
      items: [{
        value: 'foo',
        count: 100,
      }],
    });

    expect(transformProps({
      facetValues: [
        {
          name: 'foo',
          count: 100,
          isRefined: false,
        },
        {
          name: 'bar',
          count: 200,
          isRefined: false,
        },
      ],
      limit: 1,
    })).toEqual({
      items: [{
        value: 'foo',
        count: 100,
      }],
    });

    expect(transformProps({
      facetValues: [
        {
          name: 'foo',
          count: 100,
          isRefined: false,
        },
        {
          name: 'bar',
          count: 200,
          isRefined: false,
        },
      ],
      limit: 2,
    })).toEqual({
      items: [
        {
          value: 'foo',
          count: 100,
        },
        {
          value: 'bar',
          count: 200,
        },
      ],
    });
  });

  it('refines the facet refinements', () => {
    function testFacetType(facetType) {
      let state;

      const key = facetType === 'disjunctive' ? 'disjunctiveFacets' : 'facets';
      const isRefinedMethodKey = facetType === 'disjunctive' ?
        'isDisjunctiveFacetRefined' :
        'isFacetRefined';
      const addMethodKey = facetType === 'disjunctive' ?
        'addDisjunctiveFacetRefinement' :
        'addFacetRefinement';

      state = refine(new SearchParameters(), {
        facetValues: [
          {name: 'foo'},
          {name: 'bar'},
        ],
        facetType,
        attributeName: 'foo',
      }, ['foo']);
      expect(state[key]).toEqual(['foo']);
      expect(state[isRefinedMethodKey]('foo', 'foo')).toBe(true);
      expect(state[isRefinedMethodKey]('foo', 'bar')).toBe(false);

      state = refine(
        new SearchParameters({[key]: ['foo']})[addMethodKey]('foo', 'bar'),
        {
          facetValues: [
            {name: 'foo'},
            {name: 'bar'},
          ],
          facetType,
          attributeName: 'foo',
        },
        ['foo']
      );
      expect(state[key]).toEqual(['foo']);
      expect(state[isRefinedMethodKey]('foo', 'foo')).toBe(true);
      expect(state[isRefinedMethodKey]('foo', 'bar')).toBe(false);
    }

    testFacetType('disjunctive');
    testFacetType('conjunctive');
  });
});
