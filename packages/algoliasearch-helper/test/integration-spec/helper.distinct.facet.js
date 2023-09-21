'use strict';

var algoliasearchHelper = require('../../');
var utils = require('../integration-utils');
var setup = utils.setupSimple;
var createIndexName = utils.createIndexName;

var indexName = createIndexName('helper_distinct.facet');

var dataset = [
  { type: 'shoes', name: 'Adidas Stan Smith', colors: ['blue', 'red'] },
  { type: 'shoes', name: 'Converse Chuck Taylor', colors: ['blue', 'green'] },
  { type: 'shoes', name: 'Nike Air Jordan', colors: ['gold', 'red'] },
];

var config = {
  attributesToIndex: ['type', 'colors', 'name'],
  attributeForDistinct: 'type',
  attributesForFaceting: ['type', 'colors'],
};

var client;
beforeAll(function () {
  return setup(indexName, dataset, config).then(function (c) {
    client = c;
  });
});

test('[INT][FILTERS] Using distinct should let me retrieve all facet without distinct', function (done) {
  var helper = algoliasearchHelper(client, indexName, {
    facets: ['colors'],
  });

  helper.on('error', function (event) {
    done.fail(event.error);
  });

  helper.on('result', function (event) {
    expect(event.results.hits.length).toBe(1);
    expect(event.results.facets[0].data).toEqual({
      blue: 2,
      red: 2,
      gold: 1,
      green: 1,
    });

    client.deleteIndex(indexName);

    if (!process.browser) {
      client.destroy();
    }

    done();
  });

  helper.setQueryParameter('distinct', true).search();
});
