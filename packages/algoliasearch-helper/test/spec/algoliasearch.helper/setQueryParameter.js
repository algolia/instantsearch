'use strict';

var algoliasearchHelper = require('../../../index');

var fakeClient = {};

test('setChange should change the current state', function() {
  var helper = algoliasearchHelper(fakeClient, null, null);
  var changed = false;

  helper.on('change', function() {
    changed = true;
  });

  expect(helper.getPage()).toBeUndefined();
  expect(changed).toBe(false);
  helper.setQueryParameter('page', 22);
  expect(helper.getPage()).toBe(22);
  expect(changed).toBe(true);
});

test('setChange should not change the current state: no real modification', function() {
  var helper = algoliasearchHelper(fakeClient, null, {
    // @TODO: at the moment we have to provide a default value for the page, otherwise
    // some methods reset the page to 0 (because of the reset behavior). This is what
    // happens: page omit -> page defined with 0. We'll fix those issues with a next PR
    // that implements a proper reset with the updated structure of the `SearchParameters`.
    page: 0
  });
  var changed = false;
  var initialState = helper.state;

  helper.on('change', function() {
    changed = true;
  });

  expect(helper.getPage()).toBe(0);
  expect(changed).toBe(false);
  helper.setQueryParameter('page', 0);
  expect(helper.getPage()).toBe(0);
  expect(changed).toBe(false);
  expect(helper.state).toBe(initialState);
});
