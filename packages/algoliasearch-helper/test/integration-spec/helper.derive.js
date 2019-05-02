'use strict';

var utils = require('../integration-utils.js');
var setup = utils.setup;

var algoliasearchHelper = require('../../');

var random = require('lodash/random');

test(
  '[INT][DERIVE] Query the same index twice with different query',
  function() {
    var indexName = '_circle-algoliasearch-helper-js-' +
      (process.env.CIRCLE_BUILD_NUM || 'DEV') +
      'helper_distinct.facet' + random(0, 5000);

    return setup(indexName, function(client, index) {
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
      var mainHelper = algoliasearchHelper(
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

      var derivedHelper = mainHelper.derive(function(state) {
        return state.setQuery('toto');
      });

      var mainResponse = new Promise(function(resolve) {
        mainHelper.on('result', function(results, state) {
          resolve({
            results: results,
            state: state
          });
        });
      });

      var derivedResponse = new Promise(function(resolve) {
        derivedHelper.on('result', function(results, state) {
          resolve({
            results: results,
            state: state
          });
        });
      });

      mainHelper.search();

      return Promise.all([mainResponse, derivedResponse]);
    }).then(function(responses) {
      var mainResponse = responses[0];

      expect(mainResponse.state.query).toBeUndefined();
      expect(mainResponse.results.hits.length).toBe(2);

      var derivedResponse = responses[1];

      expect(derivedResponse.state.query).toBe('toto');
      expect(derivedResponse.results.hits.length).toBe(1);
      expect(derivedResponse.results.hits[0].objectID).toBe('1');
    });
  });
