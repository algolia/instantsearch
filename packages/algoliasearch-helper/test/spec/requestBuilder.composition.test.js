'use strict';

var requestBuilder = require('../../src/requestBuilder');
var SearchParameters = require('../../src/SearchParameters');
var getQueries = requestBuilder._getCompositionQueries;

test('uses the index as compositionID and nests parameters in requestBody', function () {
  var searchParams = new SearchParameters({
    index: 'products',
    query: 'phone',
  });

  expect(getQueries(searchParams)).toEqual([
    {
      compositionID: 'products',
      requestBody: { params: { query: 'phone' } },
    },
  ]);
});

test('omits empty facets and filters', function () {
  var searchParams = new SearchParameters({ index: 'products' });

  expect(getQueries(searchParams)).toEqual([
    { compositionID: 'products', requestBody: { params: {} } },
  ]);
});

test('includes tag and numeric refinements', function () {
  var searchParams = new SearchParameters({
    index: 'products',
    tagRefinements: ['sale', 'featured'],
    numericRefinements: {
      price: { '>=': [10], '<=': [100] },
      rating: { '=': [[4, 5]] },
    },
  });

  expect(getQueries(searchParams)).toEqual([
    {
      compositionID: 'products',
      requestBody: {
        params: {
          tagFilters: 'sale,featured',
          numericFilters: ['price>=10', 'price<=100', ['rating=4', 'rating=5']],
        },
      },
    },
  ]);
});

test('preserves raw filters and query parameters', function () {
  var searchParams = new SearchParameters({
    index: 'products',
    query: 'phone',
    page: 2,
    hitsPerPage: 12,
    filters: 'inStock:true',
    facetFilters: [['brand:Apple', 'brand:Samsung']],
    numericFilters: ['price>=10'],
    tagFilters: 'sale,featured',
  });

  expect(getQueries(searchParams)).toEqual([
    {
      compositionID: 'products',
      requestBody: {
        params: {
          query: 'phone',
          page: 2,
          hitsPerPage: 12,
          filters: 'inStock:true',
          facetFilters: [['brand:Apple', 'brand:Samsung']],
          numericFilters: ['price>=10'],
          tagFilters: 'sale,featured',
        },
      },
    },
  ]);
});

test('omits index and highlighting parameters without mutating state', function () {
  var searchParams = new SearchParameters({
    index: 'products',
    query: 'phone',
    highlightPreTag: '<em>',
    highlightPostTag: '</em>',
  });
  var originalParams = searchParams.getQueryParams();

  expect(getQueries(searchParams)).toEqual([
    {
      compositionID: 'products',
      requestBody: { params: { query: 'phone' } },
    },
  ]);
  expect(searchParams.getQueryParams()).toEqual(originalParams);
});

test('preserves analytics in a single query with refined facets', function () {
  var searchParams = require('../datasets/SearchParameters/search.dataset')()
    .searchParams;
  searchParams.analytics = true;

  var queries = getQueries(searchParams);

  expect(queries).toHaveLength(1);
  expect(queries[0].requestBody.params.analytics).toBe(true);
});

test('preserves clickAnalytics in a single query with refined facets', function () {
  var searchParams = require('../datasets/SearchParameters/search.dataset')()
    .searchParams;
  searchParams.clickAnalytics = true;

  var queries = getQueries(searchParams);

  expect(queries).toHaveLength(1);
  expect(queries[0].requestBody.params.clickAnalytics).toBe(true);
});

test('does not default analytics to false when unspecified', function () {
  var searchParams = require('../datasets/SearchParameters/search.dataset')()
    .searchParams;

  var queries = getQueries(searchParams);

  expect(queries).toHaveLength(1);
  expect(queries[0].requestBody.params).not.toHaveProperty('analytics');
});

test('does not default clickAnalytics to false when unspecified', function () {
  var searchParams = require('../datasets/SearchParameters/search.dataset')()
    .searchParams;

  var queries = getQueries(searchParams);

  expect(queries).toHaveLength(1);
  expect(queries[0].requestBody.params).not.toHaveProperty('clickAnalytics');
});

test('does only a single query if refinements are empty', function () {
  var searchParams = new SearchParameters({
    index: 'products',
    disjunctiveFacets: ['test_disjunctive', 'test_numeric'],
    hierarchicalFacets: [
      { name: 'test_hierarchical', attributes: ['whatever'] },
    ],
    disjunctiveFacetsRefinements: { test_disjunctive: [] },
    numericRefinements: { test_numeric: {} },
    hierarchicalFacetsRefinements: { test_hierarchical: [] },
  });

  expect(getQueries(searchParams)).toEqual([
    {
      compositionID: 'products',
      requestBody: {
        params: { facets: ['test_disjunctive', 'test_numeric', 'whatever'] },
      },
    },
  ]);
});

test('tags only refined disjunctive facets as disjunctive', function () {
  var searchParams = new SearchParameters({
    index: 'products',
    disjunctiveFacets: ['brand', 'color', 'size'],
    disjunctiveFacetsRefinements: {
      brand: ['Apple', 'Samsung'],
      color: [],
    },
  });

  expect(getQueries(searchParams)).toEqual([
    {
      compositionID: 'products',
      requestBody: {
        params: {
          facets: ['color', 'disjunctive(brand)', 'size'],
          facetFilters: [['brand:Apple', 'brand:Samsung']],
        },
      },
    },
  ]);
});

describe('hierarchical facets', function () {
  var searchParams = new SearchParameters({
    index: 'products',
    hierarchicalFacets: [
      {
        name: 'categories.lvl0',
        attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2'],
      },
    ],
    hierarchicalFacetsRefinements: {
      'categories.lvl0': ['beers > IPA > Flying dog'],
    },
  });

  test('requests parent levels in a single query', function () {
    expect(getQueries(searchParams)).toEqual([
      {
        compositionID: 'products',
        requestBody: {
          params: {
            facets: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2'],
            facetFilters: [['categories.lvl2:beers > IPA > Flying dog']],
          },
        },
      },
    ]);
  });

  test('take other facet filters into account', function () {
    var newSearchParams = searchParams
      .addDisjunctiveFacet('brand')
      .addDisjunctiveFacetRefinement('brand', 'Incipio');

    expect(getQueries(newSearchParams)).toEqual([
      {
        compositionID: 'products',
        requestBody: {
          params: {
            facets: [
              'categories.lvl0',
              'categories.lvl1',
              'categories.lvl2',
              'disjunctive(brand)',
            ],
            facetFilters: [
              ['brand:Incipio'],
              ['categories.lvl2:beers > IPA > Flying dog'],
            ],
          },
        },
      },
    ]);
  });
});

test('orders parameters alphabetically', function () {
  var searchParams = new SearchParameters({
    index: 'products',
    facets: ['test'],
    disjunctiveFacets: ['test_disjunctive', 'test_numeric'],
    disjunctiveFacetsRefinements: {
      test_disjunctive: ['test_disjunctive_value'],
    },
    numericRefinements: { test_numeric: { '>=': [10] } },
    hierarchicalFacets: [
      { name: 'test_hierarchical', attributes: ['whatever'] },
    ],
    hierarchicalFacetsRefinements: { test_hierarchical: ['item'] },
    attributesToRetrieve: ['this is last in parameters, but first in queries'],
  });

  var queries = getQueries(searchParams);

  expect(queries).toHaveLength(1);
  expect(JSON.stringify(queries[0].requestBody.params)).toBe(
    JSON.stringify({
      attributesToRetrieve: [
        'this is last in parameters, but first in queries',
      ],
      facetFilters: [
        ['test_disjunctive:test_disjunctive_value'],
        ['whatever:item'],
      ],
      facets: [
        'disjunctive(test_disjunctive)',
        'test',
        'test_numeric',
        'whatever',
      ],
      numericFilters: ['test_numeric>=10'],
    })
  );
});

describe('wildcard facets', function () {
  test('keeps as-is if no * present', function () {
    var searchParams = new SearchParameters({
      facets: ['test'],
      disjunctiveFacets: ['test_disjunctive', 'test_numeric'],
      hierarchicalFacets: [
        { name: 'test_hierarchical', attributes: ['whatever'] },
      ],
    });

    var queries = getQueries(searchParams);

    expect(queries).toHaveLength(1);
    expect(queries[0].requestBody.params.facets).toEqual([
      'test',
      'test_disjunctive',
      'test_numeric',
      'whatever',
    ]);
  });

  test('keeps only * when wildcard is requested with explicit facets', function () {
    var searchParams = new SearchParameters({
      facets: ['test', '*'],
      disjunctiveFacets: ['test_disjunctive', 'test_numeric'],
      hierarchicalFacets: [
        { name: 'test_hierarchical', attributes: ['whatever'] },
      ],
    });

    var queries = getQueries(searchParams);

    expect(queries).toHaveLength(1);
    expect(queries[0].requestBody.params.facets).toEqual(['*']);
  });

  test('keeps only * when wildcard is the first requested facet', function () {
    var searchParams = new SearchParameters({
      facets: ['*', 'test'],
      disjunctiveFacets: ['test_disjunctive', 'test_numeric'],
      hierarchicalFacets: [
        { name: 'test_hierarchical', attributes: ['whatever'] },
      ],
    });

    var queries = getQueries(searchParams);

    expect(queries).toHaveLength(1);
    expect(queries[0].requestBody.params.facets).toEqual(['*']);
  });

  test('keeps only * and refined disjunctive facets when * is not first', function () {
    var searchParams = new SearchParameters({
      facets: ['test', '*'],
      disjunctiveFacets: ['test_disjunctive', 'test_numeric'],
      hierarchicalFacets: [
        { name: 'test_hierarchical', attributes: ['whatever'] },
      ],
      disjunctiveFacetsRefinements: { test_disjunctive: ['one', 'two'] },
    });

    var queries = getQueries(searchParams);

    expect(queries).toHaveLength(1);
    expect(queries[0].requestBody.params.facets).toEqual([
      '*',
      'disjunctive(test_disjunctive)',
    ]);
    expect(queries[0].requestBody.params.facetFilters).toEqual([
      ['test_disjunctive:one', 'test_disjunctive:two'],
    ]);
  });
});

describe('request ordering', function () {
  test('should order facets and facet values by name', function () {
    var searchParams = new SearchParameters({
      facets: [
        'c_test_conjunctive_2',
        'c_conjunctive_1',
        'd_exclude_2',
        'd_exclude_1',
      ],
      disjunctiveFacets: ['b_disjunctive_2', 'b_disjunctive_1'],
      hierarchicalFacets: [
        { name: 'a_hierarchical_2', attributes: ['a_hierarchical_2'] },
        { name: 'a_hierarchical_1', attributes: ['a_hierarchical_1'] },
      ],
      hierarchicalFacetsRefinements: {
        a_hierarchical_2: ['beta'],
        a_hierarchical_1: ['alpha'],
      },
      disjunctiveFacetsRefinements: {
        b_disjunctive_2: ['beta', 'alpha'],
        b_disjunctive_1: ['beta', 'alpha'],
      },
      facetsRefinements: {
        c_conjunctive_2: ['beta', 'alpha'],
        c_conjunctive_1: ['beta', 'alpha'],
      },
      facetsExcludes: {
        d_exclude_2: ['beta', 'alpha'],
        d_exclude_1: ['beta', 'alpha'],
      },
    });

    var queries = getQueries(searchParams);

    expect(queries).toHaveLength(1);
    expect(queries[0].requestBody.params.facets).toEqual([
      'a_hierarchical_1',
      'a_hierarchical_2',
      'c_conjunctive_1',
      'c_test_conjunctive_2',
      'd_exclude_1',
      'd_exclude_2',
      'disjunctive(b_disjunctive_1)',
      'disjunctive(b_disjunctive_2)',
    ]);
    expect(queries[0].requestBody.params.facetFilters).toEqual([
      'c_conjunctive_1:alpha',
      'c_conjunctive_1:beta',
      'c_conjunctive_2:alpha',
      'c_conjunctive_2:beta',
      'd_exclude_1:-alpha',
      'd_exclude_1:-beta',
      'd_exclude_2:-alpha',
      'd_exclude_2:-beta',
      ['b_disjunctive_1:alpha', 'b_disjunctive_1:beta'],
      ['b_disjunctive_2:alpha', 'b_disjunctive_2:beta'],
      ['a_hierarchical_1:alpha'],
      ['a_hierarchical_2:beta'],
    ]);
  });
});
