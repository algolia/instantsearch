'use strict';

var utils = require('../integration-utils.js');
var setup = utils.setup;

var algoliasearchHelper = require('../../');

var map = require('lodash/map');
var random = require('lodash/random');

function hitsToParsedID(h) {
  return parseInt(h.objectID, 10);
}

test('[INT][TAGS]Test tags operations on the helper and their results on the algolia API', function(done) {
  var indexName = '_circle-algoliasearch-helper-js-' +
    (process.env.CIRCLE_BUILD_NUM || 'DEV') +
    'helper_refinements' + random(0, 5000);

  setup(indexName, function(client, index) {
    return index.addObjects([
      {objectID: '0', _tags: ['t1', 't2']},
      {objectID: '1', _tags: ['t1', 't3']},
      {objectID: '2', _tags: ['t2', 't3']},
      {objectID: '3', _tags: ['t3', 't4']}
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
        helper.addTag('t1').search();
      }

      if (calls === 2) {
        expect(content.hits.length).toBe(2);
        expect(map(content.hits, hitsToParsedID).sort()).toEqual([0, 1]);
        helper.addTag('t2').search();
      }

      if (calls === 3) {
        expect(content.hits.length).toBe(1);
        expect(map(content.hits, hitsToParsedID).sort()).toEqual([0]);
        helper.removeTag('t2').toggleTag('t3').toggleTag('t1').search();
      }

      if (calls === 4) {
        expect(content.hits.length).toBe(3);
        expect(map(content.hits, hitsToParsedID).sort()).toEqual([1, 2, 3]);
        helper.clearTags().setQueryParameter('tagFilters', 't3,(t1,t2)').search();
      }

      if (calls === 5) {
        expect(content.hits.length).toBe(2);
        expect(map(content.hits, hitsToParsedID).sort()).toEqual([1, 2]);
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
