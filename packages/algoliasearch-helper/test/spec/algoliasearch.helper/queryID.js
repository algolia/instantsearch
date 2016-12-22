'use strict';

var test = require('tape');
var algoliasearchHelper = require('../../../index');

var fakeClient = {
  addAlgoliaAgent: function() {}
};

test('the queryid should keep increasing when new requests arrives', function(t) {
  var initialQueryID;
  var client = {
    addAlgoliaAgent: function() {},
    search: function() {
      initialQueryID++;
    }
  };
  var helper = algoliasearchHelper(client, null, {});

  initialQueryID = helper._queryId;

  helper.search().search().search().search().search();

  t.equal(helper._queryId, initialQueryID, 'the _queryID should have increased of the number of calls');

  t.end();
});

test('the response handler should check that the query is not outdated', function(t) {
  var testData = require('../search.testdata');
  var shouldTriggerResult = true;
  var callCount = 0;

  var helper = algoliasearchHelper(fakeClient, null, {});

  helper.on('result', function() {
    callCount++;

    if (!shouldTriggerResult) {
      t.fail('The id was outdated');
    }
  });

  helper._handleResponse(helper.state, helper._lastQueryIdReceived + 1, null, testData.response);
  helper._handleResponse(helper.state, helper._lastQueryIdReceived + 10, null, testData.response);
  t.equal(callCount, 2, 'the callback should have been called twice');
  shouldTriggerResult = false;
  helper._handleResponse(helper.state, helper._lastQueryIdReceived - 1, null, testData.response);
  t.equal(callCount, 2, "and shouldn't have been called if outdated");

  t.end();
});
