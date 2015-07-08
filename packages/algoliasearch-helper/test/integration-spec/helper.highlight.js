'use strict';

var bind = require('lodash/function/bind');
var random = require('lodash/number/random');
var test = require('tape');
var algoliasearchHelper = process.browser ? window.algoliasearchHelper : require('../../');
var utils = require('../integration-utils.js');
var setup = utils.setup;

if (!utils.shouldRun) {
  test = test.skip;
}

test('[INT][HIGHLIGHT] The highlight should be consistent with the parameters', function(t) {
  var indexName = (process.env.TRAVIS_BUILD_NUMBER ||
    'helper-integration-tests-') + 'helper_highlight' + random(0, 5000);

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
      attributesToHighlight: ['facet'],
      facets: ['facet']
    });

    var calls = 0;
    helper.on('result', function(content) {
      calls++;
      if (calls === 1) {
        t.equal(content.hits[0]._highlightResult.facet[0].value,
          '<em>f1</em>',
          'should be hightlighted with em (default)');
        t.equal(content.hits[1]._highlightResult.facet[0].value,
          '<em>f1</em>',
          'should be hightlighted with em (default)');
        helper.setQueryParameter('highlightPostTag', '</strong>')
          .setQueryParameter('highlightPreTag', '<strong>')
          .search();
      } else if (calls === 2) {
        t.equal(content.hits[0]._highlightResult.facet[0].value,
          '<strong>f1</strong>',
          'should be hightlighted with strong (setting)');
        t.equal(content.hits[1]._highlightResult.facet[0].value,
          '<strong>f1</strong>',
          'should be hightlighted with strong (setting)');
        client.deleteIndex(indexName);
        if (!process.browser) {
          client.destroy();
        }
        t.end();
      }
    });

    helper.setQuery('f1')
      .search();
  })
    .then(null, bind(t.error, t));
});
