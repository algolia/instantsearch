'use strict';

var test = require('tape');
var algoliasearchHelper = require('../../../index');

var fakeClient = {};

test('setChange should change the current state', function(t) {
  var helper = algoliasearchHelper(fakeClient, null, null);
  var changed = false;

  helper.on('change', function() {
    changed = true;
  });

  t.equal(helper.getCurrentPage(), 0, 'Initially page is 0');
  t.notOk(changed, 'No changes called yet');
  helper.setQueryParameter('page', 22);
  t.equal(helper.getCurrentPage(), 22, 'After setting the page is 22');
  t.ok(changed, 'Change event should have been triggered');

  t.end();
});

test('setChange should not change the current state: no real modification', function(t) {
  var helper = algoliasearchHelper(fakeClient, null, null);
  var changed = false;
  var initialState = helper.state;

  helper.on('change', function() {
    changed = true;
  });

  t.equal(helper.getCurrentPage(), 0, 'Initially page is 0');
  t.notOk(changed, 'No changes called yet');
  helper.setQueryParameter('page', 0);
  t.equal(helper.getCurrentPage(), 0, 'After setting the page is 0');
  t.notOk(changed, 'Change event should not have been triggered');
  t.equal(helper.state, initialState, 'The state instance should remain the same');

  t.end();
});
