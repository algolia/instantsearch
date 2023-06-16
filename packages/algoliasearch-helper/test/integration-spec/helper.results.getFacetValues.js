'use strict';

var utils = require('../integration-utils');
var setup = utils.setupSimple;
var createIndexName = utils.createIndexName;

var algoliasearchHelper = require('../../');

var indexName = createIndexName('helper_getfacetvalues');

var dataset = [];

var config = {};

var client;
beforeAll(function() {
  return setup(indexName, dataset, config).then(function(c) {
    client = c;
  });
});

test('[INT][GETFACETVALUES] When the results are empty, getFacetValues should not crash', function(done) {
  var helper = algoliasearchHelper(client, indexName, {
    facets: ['f'],
    disjunctiveFacets: ['df'],
    hierarchicalFacets: [
      {
        name: 'products',
        attributes: ['categories.lvl0', 'categories.lvl1']
      }
    ]
  });

  helper.on('result', function(event) {
    expect(event.results.getFacetValues('f')).toEqual([]);
    expect(event.results.getFacetValues('df')).toEqual([]);
    expect(event.results.getFacetValues('products')).toEqual({
      name: 'products',
      count: null,
      isRefined: true,
      path: null,
      escapedValue: null,
      exhaustive: true,
      data: null
    });

    done();
  });

  helper.search();
});
