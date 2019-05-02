'use strict';

var utils = require('../integration-utils.js');
var setup = utils.setup;

var algoliasearchHelper = require('../../');

var random = require('lodash/random');
var map = require('lodash/map');

function hitsToParsedID(h) {
  return parseInt(h.objectID, 10);
}

test('[INT][NUMERICS][RAW-API]Test numeric operations on the helper and their results on the algolia API',
  function(done) {
    var indexName = '_circle-algoliasearch-helper-js-' +
      (process.env.CIRCLE_BUILD_NUM || 'DEV') +
      'helper_numerics' + random(0, 5000);

    setup(indexName, function(client, index) {
      return index.addObjects([
        {objectID: '0', n: [6]},
        {objectID: '1', n: [6, 10]},
        {objectID: '2', n: [5, 45]},
        {objectID: '3', n: 12}
      ])
        .then(function(content) {
          return index.waitTask(content.taskID);
        }).then(function() {
          return client;
        });
    }).then(function(client) {
      var helper = algoliasearchHelper(client, indexName, {});

      var calls = 0;

      helper.on('error', function(err) {
        done.fail(err);
      });

      helper.on('result', function(content) {
        calls++;

        if (calls === 1) {
          expect(content.hits.length).toBe(4);
          expect(map(content.hits, hitsToParsedID).sort()).toEqual([0, 1, 2, 3]);
          helper.setQueryParameter('numericFilters', 'n=6,n=10').search();
        }

        if (calls === 2) {
          expect(content.hits.length).toBe(1);
          expect(map(content.hits, hitsToParsedID).sort()).toEqual([1]);
          helper.setQueryParameter('numericFilters', '(n=6,n>40)').search();
        }

        if (calls === 3) {
          expect(content.hits.length).toBe(3);
          expect(map(content.hits, hitsToParsedID).sort()).toEqual([0, 1, 2]);
          helper.setQueryParameter('numericFilters', 'n:11 to 46').search();
        }

        if (calls === 4) {
          expect(content.hits.length).toBe(2);
          expect(map(content.hits, hitsToParsedID).sort()).toEqual([2, 3]);
          helper.setQueryParameter('numericFilters', 'n=5,(n=10,n=45)').search();
        }

        if (calls === 5) {
          expect(content.hits.length).toBe(1);
          expect(map(content.hits, hitsToParsedID).sort()).toEqual([2]);
          client.deleteIndex(indexName);
          if (!process.browser) {
            client.destroy();
          }
          done();
        }
      });

      helper.search();
    });
  });

test('[INT][NUMERICS][MANAGED-API]Test numeric operations on the helper and their results on the algolia API',
  function(done) {
    var indexName = '_circle-algoliasearch-helper-js-' +
      (process.env.CIRCLE_BUILD_NUM || 'DEV') +
      'helper_numerics_managed' + random(0, 5000);

    setup(indexName, function(client, index) {
      return index.addObjects([
        {objectID: '0', n: [6]},
        {objectID: '1', n: [6, 10]},
        {objectID: '2', n: [5, 45]},
        {objectID: '3', n: 12}
      ])
        .then(function(content) {
          return index.waitTask(content.taskID);
        }).then(function() {
          return client;
        });
    }).then(function(client) {
      var helper = algoliasearchHelper(client, indexName, {});

      var calls = 0;

      helper.on('error', function(err) {
        done.fail(err);
      });

      helper.on('result', function(content) {
        calls++;

        if (calls === 1) {
          expect(content.hits.length).toBe(4);
          expect(map(content.hits, hitsToParsedID).sort()).toEqual([0, 1, 2, 3]);
          helper.addNumericRefinement('n', '=', '6');
          helper.addNumericRefinement('n', '=', '10');
          helper.search();
        }

        if (calls === 2) {
          expect(content.hits.length).toBe(1);
          expect(map(content.hits, hitsToParsedID).sort()).toEqual([1]);
          helper.clearRefinements('n');
          helper.addNumericRefinement('n', '=', [6, 45]).search();
        }

        if (calls === 3) {
          expect(content.hits.length).toBe(3);
          expect(map(content.hits, hitsToParsedID).sort()).toEqual([0, 1, 2]);
          helper.addNumericRefinement('n', '=', 5);
          helper.removeNumericRefinement('n', '=', [6, 45]);
          helper.addNumericRefinement('n', '=', [10, 45]);
          helper.search();
        }

        if (calls === 4) {
          expect(content.hits.length).toBe(1);
          expect(map(content.hits, hitsToParsedID).sort()).toEqual([2]);
          client.deleteIndex(indexName);
          if (!process.browser) {
            client.destroy();
          }
          done();
        }
      });

      helper.search();
    });
  });
