'use strict';

var utils = require('../integration-utils.js');
var setup = utils.setup;

var algoliasearchHelper = utils.isCIBrowser ? window.algoliasearchHelper : require('../../');

var random = require('lodash/random');

if (!utils.shouldRun) {
  test = test.skip;
}

test('[INT][FILTERS] Should retrieve different values for multi facetted records', function(done) {
  var indexName = '_travis-algoliasearch-helper-js-' +
    (process.env.TRAVIS_BUILD_NUMBER || 'DEV') +
    'helper_refinements' + random(0, 5000);

  setup(indexName, function(client, index) {
    return index.addObjects([
      {facet: ['f1', 'f2']},
      {facet: ['f1', 'f3']},
      {facet: ['f2', 'f3']}
    ])
      .then(function() {
        return index.setSettings({
          attributesToIndex: ['facet'],
          attributesForFaceting: ['facet']
        });
      })
      .then(function(content) {
        return index.waitTask(content.taskID);
      }).then(function() {
        return client;
      });
  }).then(function(client) {
    var helper = algoliasearchHelper(client, indexName, {
      facets: ['facet']
    });

    var calls = 0;

    helper.on('error', function(err) {
      done.fail(err);
    });

    helper.on('result', function(content) {
      calls++;

      if (calls === 1) {
        expect(content.hits.length).toBe(2);
        expect(content.facets[0].data).toEqual({
          f1: 2,
          f2: 1,
          f3: 1
        });

        helper.addRefine('facet', 'f2').search();
      }

      if (calls === 2) {
        expect(content.hits.length).toBe(1);
        expect(content.facets[0].data).toEqual({
          f1: 1,
          f2: 1
        });

        helper.toggleRefine('facet', 'f3').search();
      }

      if (calls === 3) {
        expect(content.hits.length).toBe(0);
        expect(content.facets[0]).toBe(undefined);

        helper.removeRefine('facet', 'f2').search();
      }

      if (calls === 4) {
        expect(content.hits.length).toBe(1);
        expect(content.facets[0].data).toEqual({
          f1: 1,
          f3: 1
        });

        client.deleteIndex(indexName);

        if (!process.browser) {
          client.destroy();
        }

        done();
      }
    });

    helper.addRefine('facet', 'f1').search();
  });
});
