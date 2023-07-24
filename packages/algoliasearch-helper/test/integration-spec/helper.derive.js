'use strict';

var algoliasearchHelper = require('../../');
var utils = require('../integration-utils');
var setup = utils.setupSimple;
var createIndexName = utils.createIndexName;

var indexName = createIndexName('helper_derive');

var dataset = [
  { objectID: '0', content: 'tata' },
  { objectID: '1', content: 'toto' },
];

var config = {};

var client;
beforeAll(function () {
  return setup(indexName, dataset, config).then(function (c) {
    client = c;
  });
});

test('[INT][DERIVE] Query the same index twice with different query', function () {
  return Promise.resolve()
    .then(function () {
      var mainHelper = algoliasearchHelper(client, indexName, {
        facets: ['f'],
        disjunctiveFacets: ['df'],
        hierarchicalFacets: [
          {
            name: 'products',
            attributes: ['categories.lvl0', 'categories.lvl1'],
          },
        ],
      });

      var derivedHelper = mainHelper.derive(function (state) {
        return state.setQuery('toto');
      });

      var mainResponse = new Promise(function (resolve) {
        mainHelper.on('result', resolve);
      });

      var derivedResponse = new Promise(function (resolve) {
        derivedHelper.on('result', resolve);
      });

      mainHelper.search();

      return Promise.all([mainResponse, derivedResponse]);
    })
    .then(function (responses) {
      var mainResponse = responses[0];

      expect(mainResponse.state.query).toBeUndefined();
      expect(mainResponse.results.hits.length).toBe(2);

      var derivedResponse = responses[1];

      expect(derivedResponse.state.query).toBe('toto');
      expect(derivedResponse.results.hits.length).toBe(1);
      expect(derivedResponse.results.hits[0].objectID).toBe('1');
    });
});
