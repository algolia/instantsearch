'use strict';

var test = require('tape');

var requestBuilder = require('../../src/requestBuilder.js');
var getQueries = requestBuilder._getQueries;

test('The request builder should generate queries according to the search parameters', function(t) {
  var testData = require('./search.testdata.js')();
  var searchParams = testData.searchParams;

  var queries = getQueries(searchParams.index, searchParams);
  t.equal(queries.length, 2);
  t.equal(queries[0].params.analytics, undefined, 'the parameter analytics should not be defined on the first query');
  t.equal(queries[1].params.analytics, false, 'the parameter analytics should be set to false on the second query');

  t.end();
});
