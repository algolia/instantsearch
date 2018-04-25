'use strict';

var test = require('tape');

var algoliasearchHelper = require('../../../../index.js');

test('[Derivated helper] no derivatives', function(t) {
  t.plan(1);
  var client = {
    search: searchTest
  };
  var helper = algoliasearchHelper(client, '');
  helper.search();

  function searchTest(requests) {
    t.equal(
      requests.length,
      1,
      'Without the derivatives and no filters, the helper generates a single query'
    );

    return new Promise(function() {});
  }
});

test('[Derivated helper] 1 derivatives, no modifications', function(t) {
  t.plan(2);
  var client = {
    search: searchTest
  };
  var helper = algoliasearchHelper(client, '');
  helper.derive(function(s) { return s; });
  helper.search();

  function searchTest(requests) {
    t.equal(
      requests.length,
      2,
      'the helper generates a two queries'
    );
    t.deepEqual(
      requests[0],
      requests[1],
      'the helper generates the same query twice'
    );

    return new Promise(function() {});
  }
});

test('[Derivated helper] no derivatives, modification', function(t) {
  t.plan(4);
  var client = {
    search: searchTest
  };
  var helper = algoliasearchHelper(client, '');
  helper.derive(function(s) { return s.setQuery('otherQuery'); });
  helper.search();

  function searchTest(requests) {
    t.equal(
      requests.length,
      2,
      'the helper generates a two queries'
    );
    t.equal(requests[0].params.query, '', 'the first query is empty');
    t.equal(requests[1].params.query, 'otherQuery', 'the other query contains `otherQuery`');

    delete requests[0].params.query;
    delete requests[1].params.query;

    t.deepEqual(
      requests[0],
      requests[1],
      'Without the query the other parameters are identical'
    );

    return new Promise(function() {});
  }
});
