'use strict';

var utils = require('../integration-utils.js');
var setup = utils.setup;

var algoliasearchHelper = require('../../');

var find = require('lodash/find');
var random = require('lodash/random');

var indexName = '_circle-algoliasearch-helper-js-' +
  (process.env.CIRCLE_BUILD_NUM || 'DEV') +
  'helper_searchonce' + random(0, 5000);

test(
  '[INT][SEARCHONCE] Should be able to search once with custom parameters without changing main search state',
  function(done) {
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
        done.fail(err);
      });

      helper.on('result', function(event) {
        if (calls === 3) {
          expect(event.results.hits.length).toBe(3);
          done();
        } else {
          done.fail('Should not trigger the result event until the third call');
        }
      });

      var state1 = state0.setFacets(['facet']).addFacetRefinement('facet', 'f1');
      helper.searchOnce(state1).then(function(res) {
        expect(helper.state).toBe(state0);
        expect(res.state).toEqual(state1);
        expect(res.content.hits.length).toBe(2);
        expect(find(res.content.hits, {objectID: '2'})).toBeTruthy();
        expect(find(res.content.hits, {objectID: '1'})).toBeTruthy();
        calls++;
        var state2 = state0.setFacets(['facet']).addFacetRefinement('facet', 'f2');
        helper.searchOnce(
          state2,
          function(err, c, s) {
            expect(err).toBe(null);
            expect(helper.state).toBe(state0);
            expect(s).toEqual(state2);
            expect(c.hits.length).toBe(2);
            expect(find(c.hits, {objectID: '1'})).toBeTruthy();
            expect(find(c.hits, {objectID: '3'})).toBeTruthy();
            calls++;
            helper.search();
          });
      });
    });
  });
