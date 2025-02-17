'use strict';

var algoliasearchHelper = require('../../');
var utils = require('../integration-utils');
var setup = utils.setupSimple;
var createIndexName = utils.createIndexName;

var indexName = createIndexName('helper_numerics');

var dataset = [
  { objectID: '0', n: [6] },
  { objectID: '1', n: [6, 10] },
  { objectID: '2', n: [5, 45] },
  { objectID: '3', n: 12 },
];

var config = {};

var client;
beforeAll(function () {
  return setup(indexName, dataset, config).then(function (c) {
    client = c;
  });
});

function hitsToParsedID(h) {
  return parseInt(h.objectID, 10);
}

test('[INT][NUMERICS][RAW-API]Test numeric operations on the helper and their results on the algolia API', function (done) {
  var helper = algoliasearchHelper(client, indexName, {});

  var calls = 0;

  helper.on('error', function (event) {
    done(event.error);
  });

  helper.on('result', function (event) {
    calls++;

    var results = event.results;

    if (calls === 1) {
      expect(results.hits.length).toBe(4);
      expect(results.hits.map(hitsToParsedID).sort()).toEqual([0, 1, 2, 3]);
      helper.setQueryParameter('numericFilters', 'n=6,n=10').search();
    }

    if (calls === 2) {
      expect(results.hits.length).toBe(1);
      expect(results.hits.map(hitsToParsedID).sort()).toEqual([1]);
      helper.setQueryParameter('numericFilters', '(n=6,n>40)').search();
    }

    if (calls === 3) {
      expect(results.hits.length).toBe(3);
      expect(results.hits.map(hitsToParsedID).sort()).toEqual([0, 1, 2]);
      helper.setQueryParameter('numericFilters', 'n:11 to 46').search();
    }

    if (calls === 4) {
      expect(results.hits.length).toBe(2);
      expect(results.hits.map(hitsToParsedID).sort()).toEqual([2, 3]);
      helper.setQueryParameter('numericFilters', 'n=5,(n=10,n=45)').search();
    }

    if (calls === 5) {
      expect(results.hits.length).toBe(1);
      expect(results.hits.map(hitsToParsedID).sort()).toEqual([2]);
      client.deleteIndex(indexName);
      if (!process.browser) {
        client.destroy();
      }
      done();
    }
  });

  helper.search();
});

test('[INT][NUMERICS][MANAGED-API]Test numeric operations on the helper and their results on the algolia API', function (done) {
  var helper = algoliasearchHelper(client, indexName, {});

  var calls = 0;

  helper.on('error', function (event) {
    done(event.error);
  });

  helper.on('result', function (event) {
    calls++;

    var results = event.results;

    if (calls === 1) {
      expect(results.hits.length).toBe(4);
      expect(results.hits.map(hitsToParsedID).sort()).toEqual([0, 1, 2, 3]);
      helper.addNumericRefinement('n', '=', '6');
      helper.addNumericRefinement('n', '=', '10');
      helper.search();
    }

    if (calls === 2) {
      expect(results.hits.length).toBe(1);
      expect(results.hits.map(hitsToParsedID).sort()).toEqual([1]);
      helper.clearRefinements('n');
      helper.addNumericRefinement('n', '=', [6, 45]).search();
    }

    if (calls === 3) {
      expect(results.hits.length).toBe(3);
      expect(results.hits.map(hitsToParsedID).sort()).toEqual([0, 1, 2]);
      helper.addNumericRefinement('n', '=', 5);
      helper.removeNumericRefinement('n', '=', [6, 45]);
      helper.addNumericRefinement('n', '=', [10, 45]);
      helper.search();
    }

    if (calls === 4) {
      expect(results.hits.length).toBe(1);
      expect(results.hits.map(hitsToParsedID).sort()).toEqual([2]);
      client.deleteIndex(indexName);
      if (!process.browser) {
        client.destroy();
      }
      done();
    }
  });

  helper.search();
});
