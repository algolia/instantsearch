'use strict';

var SearchResults = require('../../../src/SearchResults');
var SearchParameters = require('../../../src/SearchParameters');

var response = {
  results: [
    {
      page: 0,
      index: 'test_hotels-node',
      facets: {
        age: {},
        price: {},
      },
      facets_stats: {
        age: {
          min: 21,
          max: 42,
          avg: 31.5,
        },
        price: {
          min: 30,
          max: 60,
          avg: 33.5,
        },
      },
      params:
        'query=&hitsPerPage=20&page=0&facets=%5B%5D&facetFilters=%5B%5B%2' +
        '2city%3AParis%22%2C%22city%3ANew%20York%22%5D%5D',
      exhaustiveFacetsCount: true,
      nbHits: 4,
      query: '',
      processingTimeMS: 2,
      nbPages: 1,
      hitsPerPage: 20,
    },
  ],
};

test('getFacetStats(facetName) returns stats for any facet or disjunctiveFacet', function () {
  var searchParams = new SearchParameters({
    facets: ['age', 'country'],
    disjunctiveFacets: ['price'],
  });
  var result = new SearchResults(searchParams, response.results);

  expect(result.getFacetStats('city')).toBeUndefined();
  expect(result.getFacetStats('country')).toBeUndefined();
  expect(result.getFacetStats('age')).toEqual(
    response.results[0].facets_stats.age
  );
  expect(result.getFacetStats('price')).toEqual(
    response.results[0].facets_stats.price
  );
});

test('getFacetStats(facetName) returns stats if the facet is both a regular and disjunctive facet', function () {
  var searchParams = new SearchParameters({
    facets: ['price'],
    disjunctiveFacets: ['price'],
  });
  var result = new SearchResults(searchParams, response.results);

  expect(result.getFacetStats('price')).toEqual(
    response.results[0].facets_stats.price
  );
});
