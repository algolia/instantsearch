'use strict';

var algoliasearchHelper = require('../../../index');

var fakeClient = {};

test('setChange should change the current page', function () {
  var helper = algoliasearchHelper(fakeClient, null, null);

  expect(helper.getPage()).toBeUndefined();

  helper.setPage(3);

  expect(helper.getPage()).toBe(3);
});

test('nextPage should increment the page by one', function () {
  var helper = algoliasearchHelper(fakeClient, null, null);

  expect(helper.getPage()).toBeUndefined();

  helper.nextPage();
  helper.nextPage();
  helper.nextPage();

  expect(helper.getPage()).toBe(3);
});

test('previousPage should decrement the current page by one', function () {
  var helper = algoliasearchHelper(fakeClient, null, null);

  expect(helper.getPage()).toBeUndefined();

  helper.setPage(3);

  expect(helper.getPage()).toBe(3);

  helper.previousPage();

  expect(helper.getPage()).toBe(2);
});

test('previousPage should throw an error without a current page', function () {
  var helper = algoliasearchHelper(fakeClient, null, null);

  expect(function () {
    helper.previousPage();
  }).toThrow('Page requested below 0.');
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

    ['toggleRefine', 'f1', 'v1'],
    ['toggleExclude', 'facet1', '55'],
  ].forEach(function ([fn, ...args]) {
    helper.setPage(10);

    expect(helper.getPage()).toBe(10);

    helper[fn](...args);

    expect(helper.getPage()).toBe(0);
  });
});
