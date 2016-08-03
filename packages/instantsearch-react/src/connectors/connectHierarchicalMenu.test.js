/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import {SearchParameters, SearchResults} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import connectHierarchicalMenu from './connectHierarchicalMenu';
jest.unmock('./connectHierarchicalMenu');
jest.unmock('./facetRefiner');

const {
  configure,
  mapStateToProps,
  transformProps,
  refine,
} = connectHierarchicalMenu;

describe('connectHierarchicalMenu', () => {
  it('increases maxValuesPerFacet when it isn\'t big enough', () => {
    let state;
    let configuredState;

    state = new SearchParameters({maxValuesPerFacet: 100});
    configuredState = configure(state, {
      limit: 101,
    });
    expect(configuredState.maxValuesPerFacet).toBe(101);

    state = new SearchParameters({maxValuesPerFacet: 101});
    configuredState = configure(state, {
      limit: 100,
    });
    expect(configuredState.maxValuesPerFacet).toBe(101);
  });

  it('adds the required hierarchical facet', () => {
    let state;
    let configuredState;

    const hierarchicalFacet = {
      name: 'NAME',
      attributes: ['ATTRIBUTE'],
      separator: 'SEPARATOR',
      rootPath: 'ROOT_PATH',
      showParentLevel: true,
    };
    state = new SearchParameters();
    configuredState = configure(state, hierarchicalFacet);
    expect(configuredState.hierarchicalFacets).toEqual([hierarchicalFacet]);

    state = new SearchParameters({hierarchicalFacets: [hierarchicalFacet]});
    configuredState = configure(state, hierarchicalFacet);
    expect(configuredState.hierarchicalFacets).toEqual([hierarchicalFacet]);
  });

  it('provides the correct props to the component', () => {
    let props;
    let searchParameters;

    props = mapStateToProps({
      searchParameters: new SearchParameters({
        hierarchicalFacets: [{name: 'facet'}],
      }),
      searchResults: null,
    }, {
      name: 'facet',
    });
    expect(props).toEqual({facetValue: null, selectedItems: []});

    props = mapStateToProps({
      searchParameters: new SearchParameters({
        hierarchicalFacets: [{name: 'facet'}],
      }).toggleHierarchicalFacetRefinement('facet', 'bar'),
      searchResults: null,
    }, {
      name: 'facet',
    });
    expect(props).toEqual({facetValue: null, selectedItems: ['bar']});

    searchParameters = new SearchParameters({
      hierarchicalFacets: [{name: 'facet', attributes: ['lvl1']}],
    }).toggleHierarchicalFacetRefinement('facet', 'bar');
    const result = {
      facets: {
        lvl1: {
          bar: 100,
          foo: 500,
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
      name: 'facet',
    });
    expect(props).toEqual({
      facetValue: {
        name: 'facet',
        count: null,
        path: null,
        isRefined: true,
        data: [
          {
            name: 'bar',
            count: 100,
            path: 'bar',
            isRefined: true,
            data: null,
          },
          {
            name: 'foo',
            count: 500,
            path: 'foo',
            isRefined: false,
            data: null,
          },
        ],
      },
      selectedItems: ['bar'],
    });

    props = mapStateToProps({
      searchParameters,
      searchResultsSearchParameters: searchParameters,
      searchResults: new SearchResults(searchParameters, {
        results: [result, result],
      }),
    }, {
      name: 'facet',
      sortBy: ['count'],
    });
    expect(props).toEqual({
      facetValue: {
        name: 'facet',
        count: null,
        path: null,
        isRefined: true,
        data: [
          {
            name: 'foo',
            count: 500,
            path: 'foo',
            isRefined: false,
            data: null,
          },
          {
            name: 'bar',
            count: 100,
            path: 'bar',
            isRefined: true,
            data: null,
          },
        ],
      },
      selectedItems: ['bar'],
    });

    searchParameters = new SearchParameters({
      hierarchicalFacets: [{
        name: 'facet',
        attributes: ['lvl0', 'lvl1', 'lvl2'],
      }],
    }).toggleHierarchicalFacetRefinement('facet', 'bar > bar > bar');
    const result1 = {
      facets: {
        lvl0: {
          bar: 100,
        },
        lvl1: {
          'bar > bar': 40,
        },
        lvl2: {
          'bar > bar > bar': 10,
          'bar > bar > foo': 30,
        },
      },
    };
    const result2 = {
      facets: {
        lvl0: {
          bar: 100,
        },
        lvl1: {
          'bar > bar': 40,
          'bar > foo': 60,
        },
      },
    };
    const result3 = {
      facets: {
        lvl0: {
          bar: 100,
          foo: 500,
        },
      },
    };
    props = mapStateToProps({
      searchParameters,
      searchResultsSearchParameters: searchParameters,
      searchResults: new SearchResults(searchParameters, {
        results: [result1, result2, result3],
      }),
    }, {
      name: 'facet',
      sortBy: ['count'],
    });
    expect(props).toEqual({
      facetValue: {
        name: 'facet',
        count: null,
        path: null,
        isRefined: true,
        data: [
          {
            name: 'foo',
            count: 500,
            path: 'foo',
            isRefined: false,
            data: null,
          },
          {
            name: 'bar',
            count: 100,
            path: 'bar',
            isRefined: true,
            data: [
              {
                name: 'foo',
                count: 60,
                path: 'bar > foo',
                isRefined: false,
                data: null,
              },
              {
                name: 'bar',
                count: 40,
                path: 'bar > bar',
                isRefined: true,
                data: [
                  {
                    name: 'foo',
                    count: 30,
                    path: 'bar > bar > foo',
                    isRefined: false,
                    data: null,
                  },
                  {
                    name: 'bar',
                    count: 10,
                    path: 'bar > bar > bar',
                    isRefined: true,
                    data: null,
                  },
                ],
              },
            ],
          },
        ],
      },
      selectedItems: ['bar > bar > bar'],
    });
  });

  it('transforms its props', () => {
    expect(transformProps({
      facetValue: null,
    })).toEqual({});

    expect(transformProps({
      facetValue: {
        name: 'foo',
        count: 100,
        isRefined: false,
      },
    })).toEqual({
      items: [],
    });

    expect(transformProps({
      facetValue: {
        name: 'foo',
        count: 450,
        data: [
          {
            name: 'bar',
            path: 'bar',
            count: 300,
          },
          {
            name: 'foo',
            path: 'foo',
            count: 150,
            data: [
              {
                name: 'bar',
                path: 'foo > bar',
                count: 150,
              },
            ],
          },
        ],
      },
    })).toEqual({
      items: [
        {
          label: 'bar',
          value: 'bar',
          count: 300,
        },
        {
          label: 'foo',
          value: 'foo',
          count: 150,
          children: [{
            label: 'bar',
            value: 'foo > bar',
            count: 150,
          }],
        },
      ],
    });

    expect(transformProps({
      limit: 1,
      facetValue: {
        name: 'foo',
        count: 450,
        data: [
          {
            name: 'bar',
            path: 'bar',
            count: 300,
            data: [
              {
                name: 'bar',
                path: 'bar > bar',
                count: 100,
              },
              {
                name: 'foo',
                path: 'bar > foo',
                count: 50,
              },
            ],
          },
          {
            name: 'foo',
            path: 'foo',
            count: 150,
          },
        ],
      },
    })).toEqual({
      items: [
        {
          label: 'bar',
          value: 'bar',
          count: 300,
          children: [{
            label: 'bar',
            value: 'bar > bar',
            count: 100,
          }],
        },
      ],
    });
  });

  it('refines the facet refinements', () => {
    let state;

    state = refine(new SearchParameters(), {
      name: 'foo',
    }, 'bar');
    expect(state.hierarchicalFacets).toEqual([{name: 'foo'}]);
    expect(state.isHierarchicalFacetRefined('foo', 'foo')).toBe(false);
    expect(state.isHierarchicalFacetRefined('foo', 'bar')).toBe(true);

    state = refine(
      new SearchParameters({hierarchicalFacets: [{name: 'foo'}]})
        .toggleHierarchicalFacetRefinement('foo', 'foo'),
      {
        name: 'foo',
      },
      'bar'
    );
    expect(state.hierarchicalFacets).toEqual([{name: 'foo'}]);
    expect(state.isHierarchicalFacetRefined('foo', 'foo')).toBe(false);
    expect(state.isHierarchicalFacetRefined('foo', 'bar')).toBe(true);
  });
});
