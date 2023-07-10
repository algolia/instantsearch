'use strict';

var SearchResults = require('../../../src/SearchResults');
var SearchParameters = require('../../../src/SearchParameters');

test('getRefinements(facetName) returns an empty array when there is no refinements set', function () {
  var data = require('./getRefinements/noFilters.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var refinements = result.getRefinements();

  expect(refinements).toEqual([]);
});

function hasSameNames(l1, l2) {
  var res = true;
  l1.forEach(function (l1Item) {
    var l2MatchingNameElement = l2.find(function (l2Item) {
      return l2Item.name === l1Item.name;
    });
    if (!l2MatchingNameElement) res = false;
  });
  return res;
}

test('getRefinements(facetName) returns a refinement(facet) when a facet refinement is set', function () {
  var data = require('./getRefinements/conjunctive-brand-apple.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var refinements = result.getRefinements();
  var facetValues = result.getFacetValues('brand');
  var refinedFacetValues = facetValues.filter(function (f) {
    return f.isRefined === true;
  });

  var expected = [
    {
      attributeName: 'brand',
      count: 386,
      exhaustive: true,
      name: 'Apple',
      type: 'facet',
    },
  ];

  expect(refinements).toEqual(expected);
  expect(refinements.length).toBe(refinedFacetValues.length);
  expect(hasSameNames(refinements, refinedFacetValues)).toBeTruthy();
});

test('getRefinements(facetName) returns a refinement(exclude) when a facet exclusion is set', function () {
  var data = require('./getRefinements/exclude-apple.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var refinements = result.getRefinements();
  var facetValues = result.getFacetValues('brand');
  var refinedFacetValues = facetValues.filter(function (f) {
    return f.isExcluded === true;
  });

  var expected = [
    {
      attributeName: 'brand',
      count: 0,
      exhaustive: true,
      name: 'Apple',
      type: 'exclude',
    },
  ];

  expect(refinements).toEqual(expected);
  expect(refinements.length).toBe(refinedFacetValues.length);
  expect(hasSameNames(refinements, refinedFacetValues)).toBeTruthy();
});

// See: https://github.com/algolia/algoliasearch-helper-js/issues/921
test('getRefinements(facetName) returns a refinement(exclude) when a facet exclusion is set and results are artificial', function () {
  var data = require('./getRefinements/exclude-artificial-results.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var refinements = result.getRefinements();
  var facetValues = result.getFacetValues('brand');
  var refinedFacetValues = facetValues.filter(function (f) {
    return f.isExcluded === true;
  });

  var expected = [
    {
      attributeName: 'brand',
      count: 0,
      exhaustive: true,
      name: 'Apple',
      type: 'exclude',
    },
  ];

  expect(refinements).toEqual(expected);
  expect(refinements.length).toBe(refinedFacetValues.length);
  expect(hasSameNames(refinements, refinedFacetValues)).toBeTruthy();
});

test('getRefinements(facetName) returns a refinement(disjunctive) when a disjunctive refinement is set', function () {
  var data = require('./getRefinements/disjunctive-type-trendcase.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var refinements = result.getRefinements();
  var facetValues = result.getFacetValues('type');
  var refinedFacetValues = facetValues.filter(function (f) {
    return f.isRefined === true;
  });

  var expected = [
    {
      attributeName: 'type',
      count: 537,
      exhaustive: true,
      name: 'Trend cases',
      type: 'disjunctive',
    },
  ];

  expect(refinements).toEqual(expected);
  expect(refinements.length).toBe(refinedFacetValues.length);
  expect(hasSameNames(refinements, refinedFacetValues)).toBeTruthy();
});

test('getRefinements(facetName) returns a refinement(hierarchical) when a disjunctive refinement is set', function () {
  var data = require('./getRefinements/hierarchical-cards.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var refinements = result.getRefinements();

  expect(refinements).toEqual([
    {
      attributeName: 'hierarchicalCategories',
      count: 17,
      exhaustive: true,
      name: 'Best Buy Gift Cards > Entertainment Gift Cards',
      type: 'hierarchical',
    },
  ]);
});

test('getRefinements(facetName) returns a refinement(numeric) when a numeric filter is set', function () {
  var data = require('./getRefinements/numeric-rating-3.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var refinements = result.getRefinements();

  expect(refinements).toEqual([
    {
      attributeName: 'rating',
      name: 3,
      numericValue: 3,
      operator: '=',
      type: 'numeric',
    },
  ]);
});

test('getRefinements(facetName) returns a refinement(tag) when a tag is set', function () {
  var data = require('./getRefinements/dummy-tags.json');
  var searchParams = new SearchParameters(data.state);
  var result = new SearchResults(searchParams, data.content.results);

  var refinements = result.getRefinements();

  expect(refinements).toEqual([
    { attributeName: '_tags', name: 'foo', type: 'tag' },
    { attributeName: '_tags', name: 'bar', type: 'tag' },
  ]);
});
