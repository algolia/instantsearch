'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('isDisjunctiveFacetRefined returns true if value in disjunctiveFacetsRefinements', function () {
  var state = new SearchParameters({
    disjunctiveFacets: ['test'],
    disjunctiveFacetsRefinements: {
      test: ['zongo'],
    },
  });

  expect(state.isDisjunctiveFacetRefined('test', 'zongo')).toBe(true);
});

test('isDisjunctiveFacetRefined returns true if something is refined when not passing a value', function () {
  var state = new SearchParameters({
    disjunctiveFacets: ['test'],
    disjunctiveFacetsRefinements: {
      test: ['zongo'],
    },
  });

  expect(state.isDisjunctiveFacetRefined('test')).toBe(true);
});

test('isDisjunctiveFacetRefined returns false if value not in disjunctiveFacetsRefinements', function () {
  var state = new SearchParameters({
    disjunctiveFacets: ['test'],
    disjunctiveFacetsRefinements: {
      test: ['zongo'],
    },
  });

  expect(state.isDisjunctiveFacetRefined('test', 'not zongo')).toBe(false);
});

test('isDisjunctiveFacetRefined returns false if facet is not disjunctive', function () {
  var state = new SearchParameters({
    disjunctiveFacetsRefinements: {
      test: ['zongo'],
    },
  });

  expect(state.isDisjunctiveFacetRefined('test', 'zongo')).toBe(false);
});
