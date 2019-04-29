'use strict';

var requestBuilder = require('../../src/requestBuilder.js');
var getQueries = requestBuilder._getQueries;

test('The request builder should set analytics to subsequent queries', function() {
  var testData = require('../datasets/SearchParameters/search.dataset')();
  var searchParams = testData.searchParams;

  searchParams.analytics = true;

  var queries = getQueries(searchParams.index, searchParams);
  expect(queries.length).toBe(2);
  expect(queries[0].params.analytics).toBe(true);
  expect(queries[1].params.analytics).toBe(false);
});

test('The request builder should set clickAnalytics to subsequent queries', function() {
  var testData = require('../datasets/SearchParameters/search.dataset')();
  var searchParams = testData.searchParams;

  searchParams.clickAnalytics = true;

  var queries = getQueries(searchParams.index, searchParams);
  expect(queries.length).toBe(2);
  expect(queries[0].params.clickAnalytics).toBe(true);
  expect(queries[1].params.clickAnalytics).toBe(false);
});

test('The request builder should should force analytics to false on subsequent queries if not specified', function() {
  var testData = require('../datasets/SearchParameters/search.dataset')();
  var searchParams = testData.searchParams;

  var queries = getQueries(searchParams.index, searchParams);
  expect(queries.length).toBe(2);
  expect(queries[0].params.analytics).toBe(undefined);
  expect(queries[1].params.analytics).toBe(false);
});

test('The request builder should should force clickAnalytics to false on subsequent queries if not specified', function() {
  var testData = require('../datasets/SearchParameters/search.dataset')();
  var searchParams = testData.searchParams;

  var queries = getQueries(searchParams.index, searchParams);
  expect(queries.length).toBe(2);
  expect(queries[0].params.clickAnalytics).toBe(undefined);
  expect(queries[1].params.clickAnalytics).toBe(false);
});
