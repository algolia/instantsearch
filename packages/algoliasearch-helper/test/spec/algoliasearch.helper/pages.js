'use strict';

var algoliasearchHelper = require('../../../index');

var fakeClient = {};

test('setPage should change the current page', function () {
  var helper = algoliasearchHelper(fakeClient, null, null);

  expect(helper.getPage()).toBeUndefined();

  helper.setPage(3);

  expect(helper.getPage()).toBe(3);
});

test('pages should be reset if the mutation might change the number of pages', function () {
  var helper = algoliasearchHelper(fakeClient, '', {
    facets: ['facet1', 'f2'],
    disjunctiveFacets: ['f1'],
  });

  [
    ['clearRefinements'],
    ['setQuery', 'query'],
    ['addNumericRefinement', 'facet', '>', '2'],
    ['removeNumericRefinement', 'facet', '>'],

    ['addFacetExclusion', 'facet1', 'val2'],
    ['removeFacetExclusion', 'facet1', 'val2'],

    ['addFacetRefinement', 'f2', 'val'],
    ['removeFacetRefinement', 'f2', 'val'],

    ['addDisjunctiveFacetRefinement', 'f1', 'val'],
    ['removeDisjunctiveFacetRefinement', 'f1', 'val'],

    ['toggleFacetRefinement', 'f1', 'v1'],
    ['toggleFacetExclusion', 'facet1', '55'],
  ].forEach(function ([fn, ...args]) {
    helper.setPage(10);

    expect(helper.getPage()).toBe(10);

    helper[fn](...args);

    expect(helper.getPage()).toBe(0);
  });
});
