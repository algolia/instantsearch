'use strict';
var algoliasearch = require('algoliasearch');

var algoliasearchHelper = require('../../../');

test('hierarchical facets: throw on unknown facet', function () {
  var appId = 'hierarchical-throw-appId';
  var apiKey = 'hierarchical-throw-apiKey';
  var indexName = 'hierarchical-throw-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: ['categories.lvl0'],
      },
    ],
  });

  expect(function () {
    helper.toggleRefine('unknownFacet', 'beers');
  }).toThrow();
});
