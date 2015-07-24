'use strict';

var test = require('tape');

test('hierarchical facets: using getHierarchicalFacetBreadcrumb()', function(t) {
  var algoliasearch = require('algoliasearch');

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-simple-appId';
  var apiKey = 'hierarchical-simple-apiKey';
  var indexName = 'hierarchical-simple-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3']
    }]
  });

  helper.toggleRefine('categories', 'beers > IPA > Flying dog');

  t.deepEqual(
    helper.getHierarchicalFacetBreadcrumb('categories'),
    ['beers', 'IPA', 'Flying dog'],
    'we get the hierarchical facet `categories` breadcrumb as an array'
  );

  t.end();
});
