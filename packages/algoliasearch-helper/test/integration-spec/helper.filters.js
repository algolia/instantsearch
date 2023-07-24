'use strict';

var algoliasearchHelper = require('../../');
var utils = require('../integration-utils');
var setup = utils.setupSimple;
var createIndexName = utils.createIndexName;

var indexName = createIndexName('helper_filters');

var dataset = [
  { facet: ['f1', 'f2'] },
  { facet: ['f1', 'f3'] },
  { facet: ['f2', 'f3'] },
];

var config = {
  attributesToIndex: ['facet'],
  attributesForFaceting: ['facet'],
};

var client;
beforeAll(function () {
  return setup(indexName, dataset, config).then(function (c) {
    client = c;
  });
});

test('[INT][FILTERS] Should retrieve different values for multi facetted records', function (done) {
  var helper = algoliasearchHelper(client, indexName, {
    facets: ['facet'],
  });

  var calls = 0;

  helper.on('error', function (event) {
    done.fail(event.error);
  });

  helper.on('result', function (event) {
    calls++;

    var results = event.results;

    if (calls === 1) {
      expect(results.hits.length).toBe(2);
      expect(results.facets[0].data).toEqual({
        f1: 2,
        f2: 1,
        f3: 1,
      });

      helper.addRefine('facet', 'f2').search();
    }

    if (calls === 2) {
      expect(results.hits.length).toBe(1);
      expect(results.facets[0].data).toEqual({
        f1: 1,
        f2: 1,
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
        f3: 1,
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
