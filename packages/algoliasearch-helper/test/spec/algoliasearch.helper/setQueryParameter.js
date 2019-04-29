'use strict';

var algoliasearchHelper = require('../../../index');

var fakeClient = {};

test('setChange should change the current state', function() {
  var helper = algoliasearchHelper(fakeClient, null, null);
  var changed = false;

  helper.on('change', function() {
    changed = true;
  });

  expect(helper.getCurrentPage()).toBe(0);
  expect(changed).toBeFalsy();
  helper.setQueryParameter('page', 22);
  expect(helper.getCurrentPage()).toBe(22);
  expect(changed).toBeTruthy();
});

test('setChange should not change the current state: no real modification', function() {
  var helper = algoliasearchHelper(fakeClient, null, null);
  var changed = false;
  var initialState = helper.state;

  helper.on('change', function() {
    changed = true;
  });

  expect(helper.getCurrentPage()).toBe(0);
  expect(changed).toBeFalsy();
  helper.setQueryParameter('page', 0);
  expect(helper.getCurrentPage()).toBe(0);
  expect(changed).toBeFalsy();
  expect(helper.state).toBe(initialState);
});
