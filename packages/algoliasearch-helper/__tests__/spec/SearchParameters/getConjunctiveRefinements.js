'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('getConjunctiveRefinements returns value in facets', function () {
  var state = new SearchParameters({
    facets: ['test'],
    facetsRefinements: {
      test: ['zongo'],
    },
  });

  expect(state.getConjunctiveRefinements('test')).toEqual(['zongo']);
});

test('getConjunctiveRefinements returns [] if facet is not conjunctive', function () {
  var state = new SearchParameters({
    facetsRefinements: {
      test: ['zongo'],
    },
  });

  expect(state.getConjunctiveRefinements('test')).toEqual([]);
});
