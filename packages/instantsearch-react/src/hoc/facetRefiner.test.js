/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import {SearchParameters, SearchResults} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import facetRefiner from './facetRefiner';
jest.unmock('./facetRefiner');

const {
  configure,
  mapStateToProps,
  transformProps,
  refine,
} = facetRefiner;

describe('createRefinementList', () => {
  it('increases maxValuesPerFacet when it isn\'t big enough', () => {
    let state;
    let configuredState;

    state = new SearchParameters({maxValuesPerFacet: 100});
    configuredState = configure(state, {
      valuesPerFacet: 101,
      facetType: 'conjunctive',
    });
    expect(configuredState.maxValuesPerFacet).toBe(101);

    state = new SearchParameters({maxValuesPerFacet: 101});
    configuredState = configure(state, {
      valuesPerFacet: 100,
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
      facetName: 'foo',
    });
    expect(configuredState.disjunctiveFacets).toEqual(['foo']);

    state = new SearchParameters({disjunctiveFacets: ['foo']});
    configuredState = configure(state, {
      facetType: 'disjunctive',
      facetName: 'foo',
    });
    expect(configuredState.disjunctiveFacets).toEqual(['foo']);

    state = new SearchParameters();
    configuredState = configure(state, {
      facetType: 'conjunctive',
      facetName: 'foo',
    });
    expect(configuredState.facets).toEqual(['foo']);

    state = new SearchParameters({facets: ['foo']});
    configuredState = configure(state, {
      facetType: 'conjunctive',
      facetName: 'foo',
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
        facetName: 'foo',
        facetType,
      });
      expect(props).toEqual({facetValues: null, selectedItems: []});

      props = mapStateToProps({
        searchParameters: new SearchParameters({
          [key]: ['foo'],
        })[addMethodKey]('foo', 'bar'),
        searchResults: null,
      }, {
        facetName: 'foo',
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
        facetName: 'foo',
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
        facetName: 'foo',
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
        facetName: 'foo',
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
      facetType: 'disjunctive',
      facetName: 'foo',
    });
    expect(console.warn.mock.calls.length).toBe(1);
    expect(console.warn.mock.calls[0][0]).toBe(
      'A component requested values for facet "foo", but no facet values ' +
      'were retrieved from the API. This means that you should add the ' +
      'attribute "foo" to the list of attributes for faceting in your index ' +
      'settings.'
    );
    console.warn = warn;
  });

  it('transform its props', () => {
    expect(transformProps({
      facetValues: null,
    }, {valuesPerFacet: 1})).toEqual({});

    expect(transformProps({
      facetValues: [{
        name: 'foo',
        count: 100,
        isRefined: false,
      }],
    }, {valuesPerFacet: 1})).toEqual({
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
    }, {valuesPerFacet: 1})).toEqual({
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
    }, {valuesPerFacet: 2})).toEqual({
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
        facetName: 'foo',
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
          facetName: 'foo',
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
