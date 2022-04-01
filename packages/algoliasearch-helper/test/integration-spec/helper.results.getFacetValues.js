'use strict';

var utils = require('../integration-utils.js');
var setup = utils.setup;

var algoliasearchHelper = require('../../');

var random = require('lodash/random');

var indexName = '_circle-algoliasearch-helper-js-' +
  (process.env.CIRCLE_BUILD_NUM || 'DEV') +
  'helper_searchonce' + random(0, 5000);

test(
  '[INT][GETFACETVALUES] When the results are empty, getFacetValues should not crash',
  function(done) {
    setup(indexName, function(client) {
      return client;
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
  });
