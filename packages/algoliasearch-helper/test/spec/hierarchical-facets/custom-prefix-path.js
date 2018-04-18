'use strict';

var test = require('tape');

test('hierarchical facets: custom prefix path', function(t) {
  var algoliasearch = require('algoliasearch');
  var sinon = require('sinon');

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-simple-appId';
  var apiKey = 'hierarchical-simple-apiKey';
  var indexName = 'hierarchical-simple-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2'],
      rootPath: 'beers',
      separator: ' | '
    }]
  });

  helper.toggleRefine('categories', 'beers | Belgian');

  var algoliaResponse = {
    'results': [{
      'query': 'a',
      'index': indexName,
      'hits': [{'objectID': 'one'}, {'objectID': 'two'}],
      'nbHits': 2,
      'page': 0,
      'nbPages': 1,
      'hitsPerPage': 20,
      'facets': {
        'categories.lvl0': {'beers': 3},
        'categories.lvl1': {'beers | IPA': 2, 'beers | Belgian': 1},
        'categories.lvl2': {'beers | Belgian | Blond': 2, 'beers | Belgian | Dark': 1}
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
        'categories.lvl0': {'beers': 3},
        'categories.lvl1': {'beers | IPA': 2, 'beers | Belgian': 1}
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
        'categories.lvl1': {'beers | IPA': 2, 'beers | Belgian': 1}
      }
    }]
  };

  var expectedHelperResponse = [{
    'name': 'categories',
    'count': null,
    'isRefined': true,
    'path': null,
    'data': [{
      'name': 'Belgian',
      'path': 'beers | Belgian',
      'count': 1,
      'isRefined': true,
      'data': [{
        'name': 'Blond',
        'path': 'beers | Belgian | Blond',
        'count': 2,
        'isRefined': false,
        'data': null
      }, {
        'name': 'Dark',
        'path': 'beers | Belgian | Dark',
        'count': 1,
        'isRefined': false,
        'data': null
      }]
    }, {
      'name': 'IPA',
      'path': 'beers | IPA',
      'count': 2,
      'isRefined': false,
      'data': null
    }]
  }];

  client.search = sinon
    .stub()
    .resolves(algoliaResponse);

  helper.setQuery('a').search();
  helper.once('result', function(content) {
    t.ok(client.search.calledOnce, 'client.search was called once');
    t.deepEqual(content.hierarchicalFacets, expectedHelperResponse);
    t.end();
  });
});
