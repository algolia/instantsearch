/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import {SearchParameters, SearchResults} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import createFacetRefiner from './createFacetRefiner';
jest.unmock('./createFacetRefiner');

const {
  configure,
  mapStateToProps,
  transformProps,
  refine,
} = createFacetRefiner;

describe('createFacetRefiner', () => {
  it('increases maxValuesPerFacet when it isn\'t big enough', () => {
    let state;
    let configuredState;

    state = new SearchParameters({maxValuesPerFacet: 100});
    configuredState = configure(state, {limitMin: 101});
    expect(configuredState.maxValuesPerFacet).toBe(101);

    state = new SearchParameters({maxValuesPerFacet: 101});
    configuredState = configure(state, {limitMin: 100});
    expect(configuredState.maxValuesPerFacet).toBe(101);

    state = new SearchParameters({maxValuesPerFacet: 100});
    configuredState = configure(state, {
      showMore: true,
      limitMax: 102,
      limitMin: 101,
    });
    expect(configuredState.maxValuesPerFacet).toBe(102);

    state = new SearchParameters({maxValuesPerFacet: 103});
    configuredState = configure(state, {
      showMore: true,
      limitMax: 102,
      limitMin: 101,
    });
    expect(configuredState.maxValuesPerFacet).toBe(103);
  });

  it('adds the required facet or disjunctiveFacet', () => {
    let state;
    let configuredState;

    state = new SearchParameters();
    configuredState = configure(state, {attributeName: 'foo'});
    expect(configuredState.disjunctiveFacets).toEqual(['foo']);

    state = new SearchParameters({disjunctiveFacets: ['foo']});
    configuredState = configure(state, {attributeName: 'foo'});
    expect(configuredState.disjunctiveFacets).toEqual(['foo']);

    state = new SearchParameters();
    configuredState = configure(state, {attributeName: 'foo', operator: 'and'});
    expect(configuredState.facets).toEqual(['foo']);

    state = new SearchParameters({facets: ['foo']});
    configuredState = configure(state, {attributeName: 'foo', operator: 'and'});
    expect(configuredState.facets).toEqual(['foo']);
  });

  it('provides the correct props to the component', () => {
    function testOperator(operator) {
      let props;
      let searchParameters;
      let result;

      const key = operator === 'or' ? 'disjunctiveFacets' : 'facets';
      const addMethodKey = operator === 'or' ?
        'addDisjunctiveFacetRefinement' :
        'addFacetRefinement';

      props = mapStateToProps({
        searchParameters: new SearchParameters({
          [key]: ['foo'],
        }),
        searchResults: null,
      }, {
        attributeName: 'foo',
        operator,
      });
      expect(props).toEqual({facetValues: null, selectedItems: []});

      props = mapStateToProps({
        searchParameters: new SearchParameters({
          [key]: ['foo'],
        })[addMethodKey]('foo', 'bar'),
        searchResults: null,
      }, {
        attributeName: 'foo',
        operator,
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
        operator,
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
        operator,
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
        operator,
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

    testOperator('or');
    testOperator('and');
  });

  it('warns when a requested facet wasn\'t returned from the API', () => {
    const warn = console.warn;
    console.warn = jest.fn();
    const searchParameters = new SearchParameters({
      disjunctiveFacets: ['foo'],
    });
    const result = {
      nbHits: 100,
      facets: {},
    };
    expect(console.warn.mock.calls.length).toBe(0);
    mapStateToProps({
      searchParameters,
      searchResultsSearchParameters: searchParameters,
      searchResults: new SearchResults(searchParameters, {
        results: [result, result],
      }),
    }, {
      attributeName: 'foo',
    });
    expect(console.warn.mock.calls.length).toBe(1);
    console.warn = warn;
  });

  it('transform its props', () => {
    expect(transformProps({
      facetValues: null,
    })).toEqual({});

    expect(transformProps({
      facetValues: [{
        name: 'foo',
        count: 100,
        isRefined: false,
      }],
    })).toEqual({
      items: [{
        value: 'foo',
        count: 100,
      }],
    });

    expect(transformProps({
      showMore: false,
      limitMin: 1,
      limitMax: 2,
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
    })).toEqual({
      showMore: false,
      limitMin: 1,
      limitMax: 2,
      items: [{
        value: 'foo',
        count: 100,
      }],
    });

    expect(transformProps({
      showMore: true,
      limitMin: 1,
      limitMax: 2,
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
    })).toEqual({
      showMore: true,
      limitMin: 1,
      limitMax: 2,
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
    function testOperator(operator) {
      let state;

      const key = operator === 'or' ? 'disjunctiveFacets' : 'facets';
      const isRefinedMethodKey = operator === 'or' ?
        'isDisjunctiveFacetRefined' :
        'isFacetRefined';
      const addMethodKey = operator === 'or' ?
        'addDisjunctiveFacetRefinement' :
        'addFacetRefinement';

      state = refine(new SearchParameters(), {
        facetValues: [
          {name: 'foo'},
          {name: 'bar'},
        ],
        operator,
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
          operator,
          attributeName: 'foo',
        },
        ['foo']
      );
      expect(state[key]).toEqual(['foo']);
      expect(state[isRefinedMethodKey]('foo', 'foo')).toBe(true);
      expect(state[isRefinedMethodKey]('foo', 'bar')).toBe(false);
    }

    testOperator('or');
    testOperator('and');
  });
});
