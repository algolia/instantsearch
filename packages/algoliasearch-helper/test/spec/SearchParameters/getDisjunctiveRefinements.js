'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('getDisjunctiveRefinements returns value in facets', function () {
  var state = new SearchParameters({
    disjunctiveFacets: ['test'],
    disjunctiveFacetsRefinements: {
      test: ['zongo'],
    },
  });

  expect(state.getDisjunctiveRefinements('test')).toEqual(['zongo']);
});

test('getDisjunctiveRefinements returns [] if facet is not disjunctive', function () {
  var state = new SearchParameters({
    disjunctiveFacetsRefinements: {
      test: ['zongo'],
    },
  });

  expect(state.getDisjunctiveRefinements('test')).toEqual([]);
});
