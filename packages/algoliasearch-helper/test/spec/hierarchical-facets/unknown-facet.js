'use strict';

var test = require('tape');

test('hierarchical facets: throw on unknown facet', function(t) {
  var bind = require('lodash/bind');
  var algoliasearch = require('algoliasearch');

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-throw-appId';
  var apiKey = 'hierarchical-throw-apiKey';
  var indexName = 'hierarchical-throw-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0']
    }]
  });

  t.throws(
    bind(helper.toggleRefine, helper, 'unknownFacet', 'beers'),
    'Refine on an unknown hierarchical facet throws'
  );

  t.end();
});
