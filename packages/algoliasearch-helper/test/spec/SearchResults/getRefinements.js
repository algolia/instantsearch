'use strict';

var test = require('tape');
var filter = require('lodash/filter');
var forEach = require('lodash/forEach');
var find = require('lodash/find');

var SearchResults = require('../../../src/SearchResults');
var SearchParameters = require('../../../src/SearchParameters');

test('getRefinements(facetName) returns an empty array when there is no refinements set', function(t) {
  var data = require('./getRefinements/noFilters.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content);

  var refinements = result.getRefinements();

  t.deepEqual(refinements, []);

  t.end();
});

function hasSameNames(l1, l2) {
  var res = true;
  forEach(l1, function(e) {
    var l2MatchingNameElement = find(l2, {name: e.name});
    if (!l2MatchingNameElement) res = false;
  });
  return res;
}

test('getRefinements(facetName) returns a refinement(facet) when a facet refinement is set', function(t) {
  var data = require('./getRefinements/conjunctive-brand-apple.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content);

  var refinements = result.getRefinements();
  var facetValues = result.getFacetValues('brand');
  var refinedFacetValues = filter(facetValues, function(f) {
    return f.isRefined === true;
  });

  var expected = [{
    attributeName: 'brand', count: 386, exhaustive: true, name: 'Apple', type: 'facet'
  }];

  t.deepEqual(refinements, expected);
  t.equal(refinements.length, refinedFacetValues.length);
  t.ok(hasSameNames(refinements, refinedFacetValues));

  t.end();
});

test('getRefinements(facetName) returns a refinement(exlude) when a facet exclusion is set', function(t) {
  var data = require('./getRefinements/exclude-apple.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content);

  var refinements = result.getRefinements();
  var facetValues = result.getFacetValues('brand');
  var refinedFacetValues = filter(facetValues, function(f) {
    return f.isExcluded === true;
  });

  var expected = [{
    attributeName: 'brand', count: 0, exhaustive: true, name: 'Apple', type: 'exclude'
  }];

  t.deepEqual(refinements, expected);
  t.equal(refinements.length, refinedFacetValues.length);
  t.ok(hasSameNames(refinements, refinedFacetValues));

  t.end();
});

test(
  'getRefinements(facetName) returns a refinement(disjunctive) when a disjunctive refinement is set',
  function(t) {
    var data = require('./getRefinements/disjunctive-type-trendcase.json');
    var searchParams = new SearchParameters(data.state);
    var result = new SearchResults(searchParams, data.content);

    var refinements = result.getRefinements();
    var facetValues = result.getFacetValues('type');
    var refinedFacetValues = filter(facetValues, function(f) {
      return f.isRefined === true;
    });

    var expected = [{
      attributeName: 'type', count: 537, exhaustive: true, name: 'Trend cases', type: 'disjunctive'
    }];

    t.deepEqual(refinements, expected);
    t.equal(refinements.length, refinedFacetValues.length);
    t.ok(hasSameNames(refinements, refinedFacetValues));

    t.end();
  }
);

test(
  'getRefinements(facetName) returns a refinement(hierarchical) when a disjunctive refinement is set',
  function(t) {
    var data = require('./getRefinements/hierarchical-cards.json');
    var searchParams = new SearchParameters(data.state);
    var result = new SearchResults(searchParams, data.content);

    var refinements = result.getRefinements();

    t.deepEqual(refinements, [{
      attributeName: 'hierarchicalCategories', count: 0, exhaustive: false,
      name: 'Best Buy Gift Cards > Entertainment Gift Cards', type: 'hierarchical'
    }]);

    t.end();
  });

test('getRefinements(facetName) returns a refinement(numeric) when a numeric filter is set', function(t) {
  var data = require('./getRefinements/numeric-rating-3.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content);

  var refinements = result.getRefinements();

  t.deepEqual(refinements, [{
    attributeName: 'rating', name: 3, numericValue: 3, operator: '=', type: 'numeric'
  }]);

  t.end();
});

test('getRefinements(facetName) returnes a refinement(tag) when a tag is set', function(t) {
  var data = require('./getRefinements/dummy-tags.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content);

  var refinements = result.getRefinements();

  t.deepEqual(refinements, [
    {attributeName: '_tags', name: 'foo', type: 'tag'},
    {attributeName: '_tags', name: 'bar', type: 'tag'}
  ]);

  t.end();
});
