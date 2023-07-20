'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('getExcludeRefinements returns value in facets', function () {
  var state = new SearchParameters({
    facets: ['test'],
    facetsExcludes: {
      test: ['zongo'],
    },
  });

  expect(state.getExcludeRefinements('test')).toEqual(['zongo']);
});

test('getExcludeRefinements returns [] if facet is not conjunctive', function () {
  var state = new SearchParameters({
    facetsExcludes: {
      test: ['zongo'],
    },
  });

  expect(state.getExcludeRefinements('test')).toEqual([]);
});
