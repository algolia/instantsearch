'use strict';

var utils = require('../integration-utils.js');
var setup = utils.setup;

var algoliasearchHelper = utils.isCIBrowser ? window.algoliasearchHelper : require('../../');

var random = require('lodash/random');

if (!utils.shouldRun) {
  test = test.skip;
}
var indexName = '_travis-algoliasearch-helper-js-' +
  (process.env.TRAVIS_BUILD_NUMBER || 'DEV') +
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

      helper.on('result', function(rs) {
        expect(rs.getFacetValues('f')).toEqual([]);
        expect(rs.getFacetValues('df')).toEqual([]);
        expect(rs.getFacetValues('products')).toEqual({
          name: 'products',
          count: null,
          isRefined: true,
          path: null,
          data: null
        });

        done();
      });

      helper.search();
    });
  });
