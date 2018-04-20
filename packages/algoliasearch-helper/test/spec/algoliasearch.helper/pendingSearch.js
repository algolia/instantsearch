'use strict';

var test = require('tape');
var algoliaSearch = require('algoliasearch');

var algoliasearchHelper = require('../../../index');

test('When searchOnce with callback, hasPendingRequests is true', function(t) {
  var testData = require('../search.testdata')();
  var client = algoliaSearch('dsf', 'dsfdf');

  var triggerCb;
  client.search = function() {
    return new Promise(function(done) {
      triggerCb = function() { done(testData.response); };
    });
  };

  var helper = algoliasearchHelper(client, 'test_hotels-node');
  var countNoMoreSearch = 0;
  helper.on('searchQueueEmpty', function() {
    countNoMoreSearch += 1;
  });

  t.equal(helper.hasPendingRequests(), false, 'before searchOnce');

  helper.searchOnce(helper.state, function() {
    t.equal(helper.hasPendingRequests(), false, 'after searchOnce');
    t.equal(countNoMoreSearch, 1, 'No more search should have been called once after search results');
    t.end();
  });

  t.equal(helper.hasPendingRequests(), true, 'during searchOnce');
  t.equal(countNoMoreSearch, 0, 'No more search should not have been called yet');

  triggerCb();
});

test('When searchOnce with promises, hasPendingRequests is true', function(t) {
  var testData = require('../search.testdata')();
  var client = algoliaSearch('dsf', 'dsfdf');

  var triggerCb;
  client.search = function() {
    return new Promise(function(done) {
      triggerCb = function() { done(testData.response); };
    });
  };

  var helper = algoliasearchHelper(client, 'test_hotels-node');
  var countNoMoreSearch = 0;
  helper.on('searchQueueEmpty', function() {
    countNoMoreSearch += 1;
  });

  t.equal(helper.hasPendingRequests(), false, 'before searchOnce');

  helper.searchOnce(helper.state).then(function() {
    t.equal(helper.hasPendingRequests(), false, 'after searchOnce');
    t.equal(countNoMoreSearch, 1, 'No more search should have been called once after search results');
    t.end();
  });

  t.equal(helper.hasPendingRequests(), true, 'during searchOnce');
  t.equal(countNoMoreSearch, 0, 'No more search should not have been called yet');

  triggerCb();
});

test('When searchForFacetValues, hasPendingRequests is true', function(t) {
  var testData = require('../search.testdata')();
  var client = algoliaSearch('dsf', 'dsfdf');

  var triggerCb;
  client.searchForFacetValues = function() {
    return new Promise(function(done) {
      triggerCb = function() { done([testData.response]); };
    });
  };

  var helper = algoliasearchHelper(client, 'test_hotels-node');
  var countNoMoreSearch = 0;
  helper.on('searchQueueEmpty', function() {
    countNoMoreSearch += 1;
  });

  t.equal(helper.hasPendingRequests(), false, 'before searchForFacetValues');

  helper.searchForFacetValues('').then(function() {
    t.equal(helper.hasPendingRequests(), false, 'after searchForFacetValues');
    t.equal(countNoMoreSearch, 1, 'No more search should have been called once after search results');
    t.end();
  });

  t.equal(helper.hasPendingRequests(), true, 'during searchForFacetValues');
  t.equal(countNoMoreSearch, 0, 'No more search should not have been called yet');

  triggerCb();
});

test('When helper.search(), hasPendingRequests is true', function(t) {
  var testData = require('../search.testdata')();
  var client = algoliaSearch('dsf', 'dsfdf');

  var triggerCb;
  client.search = function() {
    return new Promise(function(done) {
      triggerCb = function() { done(testData.response); };
    });
  };

  var helper = algoliasearchHelper(client, 'test_hotels-node');
  var countNoMoreSearch = 0;
  helper.on('searchQueueEmpty', function() {
    countNoMoreSearch += 1;
  });

  t.equal(helper.hasPendingRequests(), false, 'before helper.search()');

  helper.on('result', function() {
    t.equal(helper.hasPendingRequests(), false, 'after helper.search()');
    t.equal(countNoMoreSearch, 1, 'No more search should have been called once after search results');
    t.end();
  });

  helper.search();

  t.equal(helper.hasPendingRequests(), true, 'during helper.search()');
  t.equal(countNoMoreSearch, 0, 'No more search should not have be called yet');

  triggerCb();
});

test('When helper.search() and one request is discarded, hasPendingRequests is true unless all come back', function(t) {
  var testData = require('../search.testdata');
  var client = algoliaSearch('dsf', 'dsfdf');

  var triggerCbs = [];
  client.search = function() {
    return new Promise(function(done) {
      triggerCbs.push(function() { done(testData().response); });
    });
  };

  var helper = algoliasearchHelper(client, 'test_hotels-node');
  var countNoMoreSearch = 0;
  helper.on('searchQueueEmpty', function() {
    countNoMoreSearch += 1;
  });

  t.equal(helper.hasPendingRequests(), false, 'before helper.search()');

  helper.search();
  helper.search();
  helper.search();

  // intermediary result handler
  helper.once('result', function() {
    t.equal(helper.hasPendingRequests(), true, 'second request come back first, but the first is still ongoing');
    t.equal(countNoMoreSearch, 0, 'A search is still pending, which means that it should not have triggered the noMoreSearch event');
  });

  // The second search returns from algolia -> discards the first one
  triggerCbs[1]();

  // Final result handler
  helper.once('result', function() {
    t.equal(helper.hasPendingRequests(), true, 'second request come back first, but searchOnce is still ongoing');
    t.equal(countNoMoreSearch, 0, 'A search is still pending, which means that it should not have triggered the noMoreSearch event');
  });

  helper.searchOnce({}, function() {
    t.equal(helper.hasPendingRequests(), false, 'The last callback triggered is the searchOnce');
    t.equal(countNoMoreSearch, 1, 'This the last query');
  });

  // The third search returns from Algolia
  triggerCbs[2]();
  // The searchOnce should not be impacted
  triggerCbs[3]();
  triggerCbs[0]();
  // this will be ignored and it won't change anything

  setTimeout(function() {
    t.equal(helper.hasPendingRequests(), false, 'after helper.search()');
    t.equal(countNoMoreSearch, 1, 'No more search should have been called once after search results');
    t.end();
  }, 0);
});
