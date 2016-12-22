'use strict';

var utils = require('../integration-utils.js');
var setup = utils.setup;

var algoliasearchHelper = require('../../');

var test = require('tape');
var bind = require('lodash/bind');
var random = require('lodash/random');

if (!utils.shouldRun) {
  test = test.skip;
}
var indexName = '_travis-algoliasearch-helper-js-' +
  (process.env.TRAVIS_BUILD_NUMBER || 'DEV') +
  'helper_searchonce' + random(0, 5000);

test(
  '[INT][DERIVE] Query the same index twice with different query',
  function(t) {
    t.plan(5);

    setup(indexName, function(client, index) {
      return index.addObjects([
        {objectID: '0', content: 'tata'},
        {objectID: '1', content: 'toto'}
      ])
      .then(function(content) {
        return index.waitTask(content.taskID);
      }).then(function() {
        return client;
      });
    }).then(function(client) {
      var helper = algoliasearchHelper(
        client,
        indexName,
        {
          facets: ['f'],
          disjunctiveFacets: ['df'],
          hierarchicalFacets: [{
            name: 'products',
            attributes: ['categories.lvl0', 'categories.lvl1']
          }]
        }
      );
      var helper2 = helper.derive(function(state) {
        return state.setQuery('toto');
      });

      helper.on('result', function(results, state) {
        t.equal(state.query, '', 'No query should be used for this query');
        t.equal(results.hits.length, 2, 'Should retrieve all the records');
      });

      helper2.on('result', function(results, state) {
        t.equal(state.query, 'toto', 'The query `toto` should be used');
        t.equal(results.hits.length, 1, 'Should retrieve one record');
        t.equal(results.hits[0].objectID, '1', 'And it should be the record `1`');
      });

      helper.search();
    }).then(null, bind(t.error, t));
  });
