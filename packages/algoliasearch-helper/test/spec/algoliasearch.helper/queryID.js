'use strict';

var test = require('tape');
var algoliasearchHelper = require('../../../index');

var fakeClient = {};

test('the queryid should keep increasing when new requests arrives', function(t) {
  var initialQueryID;
  var client = {
    search: function() {
      initialQueryID++;
      return new Promise(function() {});
    }
  };
  var helper = algoliasearchHelper(client, null, {});

  initialQueryID = helper._queryId;

  helper.search().search().search().search().search();

  t.equal(helper._queryId, initialQueryID, 'the _queryID should have increased of the number of calls');

  t.end();
});

test('the response handler should check that the query is not outdated', function(t) {
  var testData = require('../search.testdata')();
  var shouldTriggerResult = true;
  var callCount = 0;

  var helper = algoliasearchHelper(fakeClient, null, {});

  helper.on('result', function() {
    callCount++;

    if (!shouldTriggerResult) {
      t.fail('The id was outdated');
    }
  });

  var states = [{
    state: helper.state,
    queriesCount: 1,
    helper: helper
  }];

  helper._dispatchAlgoliaResponse(states, helper._lastQueryIdReceived + 1, testData.response);
  helper._dispatchAlgoliaResponse(states, helper._lastQueryIdReceived + 10, testData.response);
  t.equal(callCount, 2, 'the callback should have been called twice');

  shouldTriggerResult = false;

  helper._dispatchAlgoliaResponse(states, helper._lastQueryIdReceived - 1, testData.response);
  t.equal(callCount, 2, "and shouldn't have been called if outdated");

  t.end();
});

test('the error handler should check that the query is not outdated', function(t) {
  var shouldTriggerError = true;
  var callCount = 0;

  var helper = algoliasearchHelper(fakeClient, null, {});

  helper.on('error', function() {
    callCount++;

    if (!shouldTriggerError) {
      t.fail('The id was outdated');
    }
  });

  helper._dispatchAlgoliaError(helper._lastQueryIdReceived + 1, new Error());
  helper._dispatchAlgoliaError(helper._lastQueryIdReceived + 10, new Error());
  t.equal(callCount, 2, 'the callback should have been called twice');

  shouldTriggerError = false;

  helper._dispatchAlgoliaError(helper._lastQueryIdReceived - 1, new Error());
  t.equal(callCount, 2, "and shouldn't have been called if outdated");

  t.end();
});
