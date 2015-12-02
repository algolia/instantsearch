'use strict';

var test = require('tape');
var SearchResults = require('../../../src/SearchResults');

test('getFacetByName should return a given facet be it disjunctive or conjunctive', function(t) {
  var data = require('../search.testdata');

  var result = new SearchResults(data.searchParams, data.response);

  var cityFacet = result.getFacetByName('city');

  t.equal(cityFacet.name, 'city', 'name');
  t.deepEqual(cityFacet.data, {
    'New York': 1,
    'Paris': 3,
    'San Francisco': 1
  }, 'values');

  t.end();
});
