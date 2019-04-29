'use strict';

var algoliasearchHelper = require('../../../index');

var bind = require('lodash/bind');

var fakeClient = {};

test('setChange should change the current page', function() {
  var helper = algoliasearchHelper(fakeClient, null, null);

  expect(helper.getCurrentPage() === 0).toBeTruthy();
  helper.setCurrentPage(3);
  expect(helper.getCurrentPage() === 3).toBeTruthy();
});

test('nextPage should increment the page by one', function() {
  var helper = algoliasearchHelper(fakeClient, null, null);

  expect(helper.getCurrentPage() === 0).toBeTruthy();
  helper.nextPage();
  helper.nextPage();
  helper.nextPage();
  expect(helper.getCurrentPage() === 3).toBeTruthy();
});

test('previousPage should decrement the current page by one', function() {
  var helper = algoliasearchHelper(fakeClient, null, null);

  expect(helper.getCurrentPage() === 0).toBeTruthy();
  helper.setCurrentPage(3);
  expect(helper.getCurrentPage() === 3).toBeTruthy();
  helper.previousPage();
  expect(helper.getCurrentPage() === 2).toBeTruthy();
});

test('pages should be reset if the mutation might change the number of pages', function() {
  var helper = algoliasearchHelper(fakeClient, '', {
    facets: ['facet1', 'f2'],
    disjunctiveFacets: ['f1']
  });

  [
    ['clearRefinements', bind(helper.clearRefinements, helper)],
    ['setQuery', bind(helper.setQuery, helper, 'query')],
    ['addNumericRefinement', bind(helper.addNumericRefinement, helper, 'facet', '>', '2')],
    ['removeNumericRefinement', bind(helper.removeNumericRefinement, helper, 'facet', '>')],

    ['addExclude', bind(helper.addExclude, helper, 'facet1', 'val2')],
    ['removeExclude', bind(helper.removeExclude, helper, 'facet1', 'val2')],

    ['addRefine', bind(helper.addRefine, helper, 'f2', 'val')],
    ['removeRefine', bind(helper.removeRefine, helper, 'f2', 'val')],

    ['addDisjunctiveRefine', bind(helper.addDisjunctiveRefine, helper, 'f1', 'val')],
    ['removeDisjunctiveRefine', bind(helper.removeDisjunctiveRefine, helper, 'f1', 'val')],

    ['toggleRefine', bind(helper.toggleRefine, helper, 'f1', 'v1')],
    ['toggleExclude', bind(helper.toggleExclude, helper, 'facet1', '55')]
  ].forEach(function(definition) {
    var fn = definition[1];

    helper.setCurrentPage(10);
    expect(helper.getCurrentPage()).toBe(10);
    fn();
    expect(helper.getCurrentPage()).toBe(0);
  });
});
