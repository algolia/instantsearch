'use strict';

var bind = require('lodash/function/bind');
var random = require('lodash/number/random');
var find = require('lodash/collection/find');
var test = require('tape');
var algoliasearchHelper = process.browser ? window.algoliasearchHelper : require('../../');
var utils = require('../integration-utils.js');
var setup = utils.setup;

if (!utils.shouldRun) {
  test = test.skip;
}
var indexName = '_travis-algoliasearch-helper-js-' +
  (process.env.TRAVIS_BUILD_NUMBER || 'DEV') +
  'helper_searchonce' + random(0, 5000);

test(
  '[INT][SEARCHONCE] Should be able to search once with custom parameters without changing main search state',
  function(t) {
    setup(indexName, function(client, index) {
      return index.addObjects([
        {objectID: '1', facet: ['f1', 'f2']},
        {objectID: '2', facet: ['f1', 'f3']},
        {objectID: '3', facet: ['f2', 'f3']}
      ]).then(function() {
        return index.setSettings({
          attributesToIndex: ['facet'],
          attributesForFaceting: ['facet']
        });
      }).then(function(content) {
        return index.waitTask(content.taskID);
      }).then(function() {
        return client;
      });
    }).then(function(client) {
      var helper = algoliasearchHelper(client, indexName);
      var state0 = helper.state;

      var calls = 1;
      helper.on('error', function(err) {
        t.fail(err);
        t.end();
      });

      helper.on('result', function(content) {
        if (calls === 3) {
          t.equal(content.hits.length, 3, 'results should contain two items');
          t.end();
        } else {
          t.fail('Should not trigger the result event until the third call');
        }
      });

      var state1 = state0.setFacets(['facet']).addFacetRefinement('facet', 'f1');
      helper.searchOnce(state1).then(function(res) {
        t.equal(helper.state, state0, 'initial state must not be modified');
        t.deepEqual(res.state, state1);
        t.equal(res.content.hits.length, 2, 'results should contain two items');
        t.ok(find(res.content.hits, {objectID: '2'}));
        t.ok(find(res.content.hits, {objectID: '1'}));
        calls++;
        var state2 = state0.setFacets(['facet']).addFacetRefinement('facet', 'f2');
        helper.searchOnce(
          state2,
          function(err, c, s) {
            t.equal(err, null);
            t.equal(helper.state, state0, 'initial state should not be modified');
            t.deepEqual(s, state2);
            t.equal(c.hits.length, 2, 'results should contain two items');
            t.ok(find(c.hits, {objectID: '1'}));
            t.ok(find(c.hits, {objectID: '3'}));
            calls++;
            helper.search();
          });
      });
    }).then(null, bind(t.error, t));
  });
