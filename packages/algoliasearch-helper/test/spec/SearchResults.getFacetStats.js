'use strict';

var test = require('tape');
var SearchResults = require('../../src/SearchResults');
var SearchParameters = require('../../src/SearchParameters');

var response = {
  'results': [{
    'page': 0,
    'index': 'test_hotels-node',
    'facets': {
      'age': {}
    },
    'facets_stats': {
      'age': {
        'min': 21,
        'max': 42,
        'avg': 31.5
      }
    },
    'params': 'query=&hitsPerPage=20&page=0&facets=%5B%5D&facetFilters=%5B%5B%2' +
      '2city%3AParis%22%2C%22city%3ANew%20York%22%5D%5D',
    'exhaustiveFacetsCount': true,
    'nbHits': 4,
    'query': '',
    'processingTimeMS': 2,
    'nbPages': 1,
    'hitsPerPage': 20
  }]
};

var searchParams = new SearchParameters({
  facets: ['age']
});

test('getFacetByName should return a given facet be it disjunctive or conjunctive', function(t) {
  var result = new SearchResults(searchParams, response);

  t.equal(
    result.getFacetStats('city'),
    undefined,
    'should be undefined as "city" does not permit stats');
  t.deepEqual(
    result.getFacetStats('age'),
    response.results[0].facets_stats.age,
    'should return the same stats data as in the response');

  t.end();
});
