'use strict';

var algoliasearch = require('algoliasearch');
algoliasearch = algoliasearch.algoliasearch || algoliasearch;

var algoliasearchHelper = require('../../../index');

test('When calling searchOnce, hasPendingRequests is true', function (done) {
  var testData = require('../../datasets/SearchParameters/search.dataset')();
  var client = algoliasearch('dsf', 'dsfdf');

  var triggerCb;
  client.search = function () {
    return new Promise(function (resolve) {
      triggerCb = function () {
        resolve(testData.response);
      };
    });
  };

  var helper = algoliasearchHelper(client, 'test_hotels-node');
  var countNoMoreSearch = 0;
  helper.on('searchQueueEmpty', function () {
    countNoMoreSearch += 1;
  });

  expect(helper.hasPendingRequests()).toBe(false);

  helper.searchOnce(helper.state).then(function () {
    expect(helper.hasPendingRequests()).toBe(false);
    expect(countNoMoreSearch).toBe(1);
    done();
  });

  expect(helper.hasPendingRequests()).toBe(true);
  expect(countNoMoreSearch).toBe(0);

  triggerCb();
});

test('When searchForFacetValues, hasPendingRequests is true', function (done) {
  var client = algoliasearch('dsf', 'dsfdf');

  let triggerCb;
  client.search = function () {
    return new Promise(function (resolve) {
      triggerCb = function () {
        resolve({
          results: [
            {
              exhaustiveFacetsCount: true,
              facetHits: [],
              processingTimeMS: 3,
            },
          ],
        });
      };
    });
  };

  var helper = algoliasearchHelper(client, 'test_hotels-node');
  var countNoMoreSearch = 0;
  helper.on('searchQueueEmpty', function () {
    countNoMoreSearch += 1;
  });

  expect(helper.hasPendingRequests()).toBe(false);

  helper.searchForFacetValues('').then(function () {
    expect(helper.hasPendingRequests()).toBe(false);
    expect(countNoMoreSearch).toBe(1);
    done();
  });

  expect(helper.hasPendingRequests()).toBe(true);
  expect(countNoMoreSearch).toBe(0);

  triggerCb();
});

test('When calling search, hasPendingRequests is true', function (done) {
  var testData = require('../../datasets/SearchParameters/search.dataset')();
  var client = algoliasearch('dsf', 'dsfdf');

  var triggerCb;
  client.search = function () {
    return new Promise(function (resolve) {
      triggerCb = function () {
        resolve(testData.response);
      };
    });
  };

  var helper = algoliasearchHelper(client, 'test_hotels-node');
  var countNoMoreSearch = 0;
  helper.on('searchQueueEmpty', function () {
    countNoMoreSearch += 1;
  });

  expect(helper.hasPendingRequests()).toBe(false);

  helper.on('result', function () {
    expect(helper.hasPendingRequests()).toBe(false);
    expect(countNoMoreSearch).toBe(1);
    done();
  });

  helper.search();

  expect(helper.hasPendingRequests()).toBe(true);
  expect(countNoMoreSearch).toBe(0);

  triggerCb();
});

test('When calling sarech and one request is discarded, hasPendingRequests is true unless all come back', function (done) {
  var testData = require('../../datasets/SearchParameters/search.dataset')();
  var client = algoliasearch('dsf', 'dsfdf');

  var triggerCbs = [];
  client.search = function () {
    return new Promise(function (resolve) {
      triggerCbs.push(function () {
        resolve(testData.response);
      });
    });
  };

  var helper = algoliasearchHelper(client, 'test_hotels-node');
  var countNoMoreSearch = 0;
  helper.on('searchQueueEmpty', function () {
    countNoMoreSearch += 1;
  });

  expect(helper.hasPendingRequests()).toBe(false);

  helper.search();
  helper.search();
  helper.search();

  // intermediary result handler
  helper.once('result', function () {
    expect(helper.hasPendingRequests()).toBe(true);
    expect(countNoMoreSearch).toBe(0);
  });

  // The second search returns from algolia -> discards the first one
  triggerCbs[1]();

  // Final result handler
  helper.once('result', function () {
    expect(helper.hasPendingRequests()).toBe(true);
    expect(countNoMoreSearch).toBe(0);
  });

  helper.searchOnce({}, function () {
    expect(helper.hasPendingRequests()).toBe(false);
    expect(countNoMoreSearch).toBe(1);
  });

  // The third search returns from Algolia
  triggerCbs[2]();
  // The searchOnce should not be impacted
  triggerCbs[3]();
  triggerCbs[0]();
  // this will be ignored and it won't change anything

  setTimeout(function () {
    expect(helper.hasPendingRequests()).toBe(false);
    expect(countNoMoreSearch).toBe(1);
    done();
  }, 0);
});
