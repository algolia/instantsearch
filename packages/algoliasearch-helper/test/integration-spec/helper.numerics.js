'use strict';

var bind = require('lodash/function/bind');
var random = require('lodash/number/random');
var test = require('tape');
var map = require('lodash/collection/map');

var algoliasearchHelper = process.browser ? window.algoliasearchHelper : require('../../');
var utils = require('../integration-utils.js');
var setup = utils.setup;

if (!utils.shouldRun) {
  test = test.skip;
}

function hitsToParsedID(h) {
  return parseInt(h.objectID, 10);
}

test('[INT][NUMERICS]Test numeric operations on the helper and their results on' +
     'the algolia API', function(t) {
  var indexName = '_travis-algoliasearch-helper-js-' +
    (process.env.TRAVIS_BUILD_NUMBER || 'DEV') +
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
      t.fail(err);
      t.end();
    });

    helper.on('result', function(content) {
      calls++;

      if (calls === 1) {
        t.equal(content.hits.length, 4, 'No numeric filter: 4 results');
        t.deepEqual(map(content.hits, hitsToParsedID).sort(),
          [0, 1, 2, 3],
          'No tags expected ids: 0, 1, 2, 3');
        helper.setQueryParameter('numericFilters', 'n=6,n=10').search();
      }

      if (calls === 2) {
        t.equal(content.hits.length, 1, 'n=6 AND n=10: 1 result');
        t.deepEqual(map(content.hits, hitsToParsedID).sort(),
          [1],
          'n=6 AND n=10 >> expected id: 1');
        helper.setQueryParameter('numericFilters', '(n=6,n>40)').search();
      }

      if (calls === 3) {
        t.equal(content.hits.length, 3, 'n=6 OR n>40: 3 results');
        t.deepEqual(map(content.hits, hitsToParsedID).sort(),
          [0, 1, 2],
          'n=6 OR n>40 >> expected ids: 0, 2');
        helper.setQueryParameter('numericFilters', 'n:11 to 46').search();
      }

      if (calls === 4) {
        t.equal(content.hits.length, 2, '11 to 46: 2 results');
        t.deepEqual(map(content.hits, hitsToParsedID).sort(),
          [2, 3],
          '11 to 46 >> expected ids: 2, 3');
        helper.setQueryParameter('numericFilters', 'n=5,(n=10,n=45)').search();
      }

      if (calls === 5) {
        t.equal(content.hits.length, 1, 'n = (5) and (10 or 45) : 1 result');
        t.deepEqual(
          map(content.hits, hitsToParsedID).sort(),
          [2],
          'n = 5 and (10 or 45) >> expected ids : 1, 2'
        );
        client.deleteIndex(indexName);
        if (!process.browser) {
          client.destroy();
        }
        t.end();
      }
    });

    helper.search();
  })
    .then(null, bind(t.error, t));
});
