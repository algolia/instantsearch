'use strict';

var test = require('tape');
var algoliasearchHelper = require('../../index');

var fakeClient = {};

test('getStateFromQueryString should parse insideBoundingBox as float georects and be consistent with the state', function(t) {
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(fakeClient, index, {
    insideBoundingBox: [[51.1241999, 9.662499900000057, 41.3253001, -5.559099999999944]]
  });

  var queryString = algoliasearchHelper.url.getQueryStringFromState(helper.getState());

  var partialStateFromQueryString = algoliasearchHelper.url.getStateFromQueryString(
    queryString
  );

  t.deepEquals(
    partialStateFromQueryString.insideBoundingBox,
    helper.state.insideBoundingBox,
    'insideBoundingBox should be consistent through query string serialization/deserialization');
  t.end();
});

test('getStateFromQueryString should parse insideBoundingBox as float georects and be consistent with the state', function(t) {
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(fakeClient, index, {
    insideBoundingBox: '51.1241999,9.662499900000057,41.3253001,-5.559099999999944'
  });

  var queryString = algoliasearchHelper.url.getQueryStringFromState(helper.getState());

  var partialStateFromQueryString = algoliasearchHelper.url.getStateFromQueryString(
    queryString
  );

  t.deepEquals(
    partialStateFromQueryString.insideBoundingBox,
    helper.state.insideBoundingBox,
    'insideBoundingBox should be consistent through query string serialization/deserialization');
  t.end();
});
