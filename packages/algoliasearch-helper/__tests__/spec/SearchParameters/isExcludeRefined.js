'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('isExcludeRefined returns true if value in facetsExcludes', function () {
  var state = new SearchParameters({
    facets: ['test'],
    facetsExcludes: {
      test: ['zongo'],
    },
  });

  expect(state.isExcludeRefined('test', 'zongo')).toBe(true);
});

test('isExcludeRefined returns true if something is refined when not passing a value', function () {
  var state = new SearchParameters({
    facets: ['test'],
    facetsExcludes: {
      test: ['zongo'],
    },
  });

  expect(state.isExcludeRefined('test')).toBe(true);
});

test('isExcludeRefined returns false if value not in facetsExcludes', function () {
  var state = new SearchParameters({
    facets: ['test'],
    facetsExcludes: {
      test: ['zongo'],
    },
  });

  expect(state.isExcludeRefined('test', 'not zongo')).toBe(false);
});

test('isExcludeRefined returns false if facet is not conjunctive', function () {
  var state = new SearchParameters({
    facetsExcludes: {
      test: ['zongo'],
    },
  });

  expect(state.isExcludeRefined('test', 'zongo')).toBe(false);
});
