'use strict';

var utils = require('../integration-utils.js');
var setup = utils.setup;

var algoliasearchHelper = require('../../');

var random = require('lodash/random');


test('[INT][FILTERS] Should retrieve different values for multi facetted records', function(done) {
  var indexName = '_circle-algoliasearch-helper-js-' +
    (process.env.CIRCLE_BUILD_NUM || 'DEV') +
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

    helper.on('error', function(event) {
      done.fail(event.error);
    });

    helper.on('result', function(event) {
      calls++;

      var results = event.results;

      if (calls === 1) {
        expect(results.hits.length).toBe(2);
        expect(results.facets[0].data).toEqual({
          f1: 2,
          f2: 1,
          f3: 1
        });

        helper.addRefine('facet', 'f2').search();
      }

      if (calls === 2) {
        expect(results.hits.length).toBe(1);
        expect(results.facets[0].data).toEqual({
          f1: 1,
          f2: 1
        });

        helper.toggleRefine('facet', 'f3').search();
      }

      if (calls === 3) {
        expect(results.hits.length).toBe(0);
        expect(results.facets[0]).toBe(undefined);

        helper.removeRefine('facet', 'f2').search();
      }

      if (calls === 4) {
        expect(results.hits.length).toBe(1);
        expect(results.facets[0].data).toEqual({
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
