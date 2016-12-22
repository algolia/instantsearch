'use strict';

var test = require('tape');

var SearchResults = require('../../../src/SearchResults');
var SearchParameters = require('../../../src/SearchParameters');

test('getFacetValues(facetName) returns a list of values using the defaults', function(t) {
  var data = require('./getFacetValues/disjunctive.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var facetValues = result.getFacetValues('brand');

  var expected = [
    {count: 386, isRefined: true, name: 'Apple'},
    {count: 551, isRefined: false, name: 'Insignia™'},
    {count: 511, isRefined: false, name: 'Samsung'}
  ];

  t.deepEqual(facetValues, expected);

  t.end();
});

test(
  'getFacetValues(facetName) when no order is specified for isRefined the order is descending',
  function(t) {
    var data = require('./getFacetValues/disjunctive.json');
    var searchParams = new SearchParameters(data.state);
    var result = new SearchResults(searchParams, data.content.results);

    var facetValues = result.getFacetValues('brand', {
      sortBy: ['isRefined']
    });

    var expected = result.getFacetValues('brand', {
      sortBy: ['isRefined:desc']
    });

    t.deepEqual(facetValues, expected);

    t.end();
  });

test('getFacetValues(facetName) when no order is specified for count the order is descending', function(t) {
  var data = require('./getFacetValues/disjunctive.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var facetValues = result.getFacetValues('brand', {
    sortBy: ['count']
  });

  var expected = result.getFacetValues('brand', {
    sortBy: ['count:desc']
  });

  t.deepEqual(facetValues, expected);

  t.end();
});

test('getFacetValues(facetName) when no order is specified for name the order is ascending', function(t) {
  var data = require('./getFacetValues/disjunctive.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var facetValues = result.getFacetValues('brand', {
    sortBy: ['name']
  });

  var expected = result.getFacetValues('brand', {
    sortBy: ['name:asc']
  });

  t.deepEqual(facetValues, expected);

  t.end();
});

test('getFacetValues(facetName) testing the sort function', function(t) {
  var data = require('./getFacetValues/disjunctive.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var facetValues = result.getFacetValues('brand', {
    sortBy: function(a, b) {
      if (a.count === b.count) return 0;
      if (a.count > b.count)   return 1;
      if (b.count > a.count)   return -1;
    }
  });

  var expected = result.getFacetValues('brand', {
    sortBy: ['count:asc']
  });

  t.deepEqual(facetValues, expected);

  t.end();
});
