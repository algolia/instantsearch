'use strict';

var test = require('tape');
var algoliasearchHelper = require('../../../index');

var fakeClient = {};

test('setChange should change the current page', function(t) {
  var helper = algoliasearchHelper(fakeClient, null, null);

  t.ok(helper.getCurrentPage() === 0, 'First page should be 0');
  helper.setCurrentPage(3);
  t.ok(helper.getCurrentPage() === 3, 'If page was changed to 3, getCurrentPage should return 3');
  t.end();
});

test('nextPage should increment the page by one', function(t) {
  var helper = algoliasearchHelper(fakeClient, null, null);

  t.ok(helper.getCurrentPage() === 0, 'First page should be 0');
  helper.nextPage();
  helper.nextPage();
  helper.nextPage();
  t.ok(helper.getCurrentPage() === 3, 'If page was increment 3 times, getCurrentPage should return 3');
  t.end();
});

test('previousPage should decrement the current page by one', function(t) {
  var helper = algoliasearchHelper(fakeClient, null, null);

  t.ok(helper.getCurrentPage() === 0, 'First page should be 0');
  helper.setCurrentPage(3);
  t.ok(helper.getCurrentPage() === 3, 'If page was changed to 3, getCurrentPage should return 3');
  helper.previousPage();
  t.ok(helper.getCurrentPage() === 2, 'must be 2 now');
  t.end();
});

test('pages should be reset if the mutation might change the number of pages', function(t) {
  var bind = require('lodash/bind');

  var helper = algoliasearchHelper(fakeClient, '', {
    facets: ['facet1', 'f2'],
    disjunctiveFacets: ['f1']
  });

  function testMutation(tester, text, testFn) {
    helper.setCurrentPage(10);
    t.equal(helper.getCurrentPage(), 10, 'set the current page to 10' + text);
    testFn();
    t.equal(helper.getCurrentPage(), 0, 'page resetted' + text);
  }

  testMutation(t, ' clearRefinements', bind(helper.clearRefinements, helper));
  testMutation(t, ' setQuery', bind(helper.setQuery, helper, 'query'));
  testMutation(t, ' addNumericRefinement', bind(helper.addNumericRefinement, helper, 'facet', '>', '2'));
  testMutation(t, ' removeNumericRefinement', bind(helper.removeNumericRefinement, helper, 'facet', '>'));

  testMutation(t, ' addExclude', bind(helper.addExclude, helper, 'facet1', 'val2'));
  testMutation(t, ' removeExclude', bind(helper.removeExclude, helper, 'facet1', 'val2'));

  testMutation(t, ' addRefine', bind(helper.addRefine, helper, 'f2', 'val'));
  testMutation(t, ' removeRefine', bind(helper.removeRefine, helper, 'f2', 'val'));

  testMutation(t, ' addDisjunctiveRefine', bind(helper.addDisjunctiveRefine, helper, 'f1', 'val'));
  testMutation(t, ' removeDisjunctiveRefine', bind(helper.removeDisjunctiveRefine, helper, 'f1', 'val'));

  testMutation(t, ' toggleRefine', bind(helper.toggleRefine, helper, 'f1', 'v1'));
  testMutation(t, ' toggleExclude', bind(helper.toggleExclude, helper, 'facet1', '55'));

  t.end();
});
