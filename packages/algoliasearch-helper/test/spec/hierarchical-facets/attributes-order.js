// This file tests a specific bug that occurs when the API returns facets data for hierarchical attributes in a
// different order than the declared attributes order at the helper initialization
'use strict';

var test = require('tape');

test('hierarchical facets: attributes order', function(t) {
  var algoliasearch = require('algoliasearch');
  var sinon = require('sinon');

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-toggleRefine-appId';
  var apiKey = 'hierarchical-toggleRefine-apiKey';
  var indexName = 'hierarchical-toggleRefine-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1']
    }]
  });

  helper.toggleFacetRefinement('categories', 'beers');

  var algoliaResponse = {
    'results': [{
      'query': 'a',
      'index': indexName,
      'hits': [{'objectID': 'one'}],
      'nbHits': 3,
      'page': 0,
      'nbPages': 1,
      'hitsPerPage': 20,
      'facets': {
        // /!\ Note that lvl1 comes *before* lvl0 here
        'categories.lvl1': {'beers > IPA': 6, 'beers > 1664': 3},
        'categories.lvl0': {'beers': 9}
      }
    }, {
      'query': 'a',
      'index': indexName,
      'hits': [{'objectID': 'one'}],
      'nbHits': 1,
      'page': 0,
      'nbPages': 1,
      'hitsPerPage': 1,
      'facets': {
        'categories.lvl0': {'beers': 9, 'fruits': 5, 'sales': 20}
      }
    }]
  };

  var expectedHelperResponse = [{
    'name': 'categories',
    'count': null,
    'isRefined': true,
    'path': null,
    'data': [{
      'name': 'beers',
      'path': 'beers',
      'count': 9,
      'isRefined': true,
      'data': [{
        'name': '1664',
        'path': 'beers > 1664',
        'count': 3,
        'isRefined': false,
        'data': null
      }, {
        'name': 'IPA',
        'path': 'beers > IPA',
        'count': 6,
        'isRefined': false,
        'data': null
      }]
    }, {
      'name': 'fruits',
      'path': 'fruits',
      'count': 5,
      'isRefined': false,
      'data': null
    }, {
      'name': 'sales',
      'path': 'sales',
      'count': 20,
      'isRefined': false,
      'data': null
    }]
  }];

  client.search = sinon
    .stub()
    .resolves(algoliaResponse);

  helper.setQuery('a').search();

  helper.once('result', function(content) {
    t.deepEqual(content.hierarchicalFacets, expectedHelperResponse);
    t.deepEqual(content.getFacetByName('categories'), expectedHelperResponse[0]);

    t.end();
  });
});
