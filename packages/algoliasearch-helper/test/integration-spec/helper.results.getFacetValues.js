'use strict';

var bind = require('lodash/function/bind');
var random = require('lodash/number/random');
var test = require('tape');
var algoliasearchHelper = process.browser &&
  process.env.TRAVIS_BUILD_NUMBER ? window.algoliasearchHelper : require('../../');
var utils = require('../integration-utils.js');
var setup = utils.setup;

if (!utils.shouldRun) {
  test = test.skip;
}
var indexName = '_travis-algoliasearch-helper-js-' +
  (process.env.TRAVIS_BUILD_NUMBER || 'DEV') +
  'helper_searchonce' + random(0, 5000);

test(
  '[INT][GETFACETVALUES] When the results are empty, getFacetValues should not crash',
  function(t) {
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
        t.deepEqual(rs.getFacetValues('f'), [], '');
        t.deepEqual(rs.getFacetValues('df'), [], '');
        t.deepEqual(
          rs.getFacetValues('products'),
          {count: null, data: null, isRefined: true, name: 'products', path: null},
          ''
        );
        t.end();
      });
      helper.search();
    }).then(null, bind(t.error, t));
  });
