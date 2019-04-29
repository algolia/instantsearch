'use strict';

var utils = require('../integration-utils.js');
var setup = utils.setup;

var algoliasearchHelper = utils.isCIBrowser ? window.algoliasearchHelper : require('../../');

var random = require('lodash/random');

if (!utils.shouldRun) {
  test = test.skip;
}

test('[INT][FILTERS] Using distinct should let me retrieve all facet without distinct', function(done) {
  var indexName = '_travis-algoliasearch-helper-js-' +
    (process.env.TRAVIS_BUILD_NUMBER || 'DEV') +
    'helper_distinct.facet' + random(0, 5000);

  setup(indexName, function(client, index) {
    return index.addObjects([
      {type: 'shoes', name: 'Adidas Stan Smith', colors: ['blue', 'red']},
      {type: 'shoes', name: 'Converse Chuck Taylor', colors: ['blue', 'green']},
      {type: 'shoes', name: 'Nike Air Jordan', colors: ['gold', 'red']}
    ])
      .then(function() {
        return index.setSettings({
          attributesToIndex: ['type', 'colors', 'name'],
          attributeForDistinct: 'type',
          attributesForFaceting: ['type', 'colors']
        });
      })
      .then(function(content) {
        return index.waitTask(content.taskID);
      }).then(function() {
        return client;
      });
  }).then(function(client) {
    var helper = algoliasearchHelper(client, indexName, {
      facets: ['colors']
    });

    helper.on('error', function(err) {
      done.fail(err);
    });

    helper.on('result', function(content) {
      expect(content.hits.length).toBe(1);
      expect(content.facets[0].data).toEqual({
        blue: 2,
        red: 2,
        gold: 1,
        green: 1
      });

      client.deleteIndex(indexName);

      if (!process.browser) {
        client.destroy();
      }

      done();
    });

    helper.setQueryParameter('distinct', true).search();
  });
});
