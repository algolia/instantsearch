'use strict';

var SearchResults = require('../../../src/SearchResults');

test('getFacetByName should return a given facet be it disjunctive or conjunctive', function () {
  var data = require('../../../test/datasets/SearchParameters/search.dataset')();

  var result = new SearchResults(data.searchParams, data.response.results);

  var cityFacet = result.getFacetByName('city');

  expect(cityFacet.name).toBe('city');
  expect(cityFacet.data).toEqual({
    'New York': 1,
    Paris: 3,
    'San Francisco': 1,
  });
});
