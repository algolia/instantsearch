'use strict';

var algoliasearchHelper = require('../../index');

var fakeClient = {};

test('getStateFromQueryString should parse insideBoundingBox as float georects and be consistent with the state', function() {
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(fakeClient, index, {
    insideBoundingBox: [[51.1241999, 9.662499900000057, 41.3253001, -5.559099999999944]]
  });

  var queryString = algoliasearchHelper.url.getQueryStringFromState(helper.getState());

  var partialStateFromQueryString = algoliasearchHelper.url.getStateFromQueryString(
    queryString
  );

  expect(partialStateFromQueryString.insideBoundingBox).toEqual(helper.state.insideBoundingBox);
});

test('getStateFromQueryString should parse insideBoundingBox as float georects and be consistent with the state', function() {
  var index = 'indexNameInTheHelper';
  var helper = algoliasearchHelper(fakeClient, index, {
    insideBoundingBox: '51.1241999,9.662499900000057,41.3253001,-5.559099999999944'
  });

  var queryString = algoliasearchHelper.url.getQueryStringFromState(helper.getState());

  var partialStateFromQueryString = algoliasearchHelper.url.getStateFromQueryString(
    queryString
  );

  expect(partialStateFromQueryString.insideBoundingBox).toEqual(helper.state.insideBoundingBox);
});
