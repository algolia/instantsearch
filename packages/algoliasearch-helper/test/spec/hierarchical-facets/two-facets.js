'use strict';

var test = require('tape');

test('hierarchical facets: two hierarchical facets', function(t) {
  var algoliasearch = require('algoliasearch');
  var sinon = require('sinon');

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-simple-appId';
  var apiKey = 'hierarchical-simple-apiKey';
  var indexName = 'hierarchical-simple-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [{
      name: 'beers',
      attributes: ['beers.lvl0']
    }, {
      name: 'fruits',
      attributes: ['fruits.lvl0']
    }]
  });

  helper.toggleRefine('beers', 'IPA');
  helper.toggleRefine('fruits', 'oranges');

  var algoliaResponse = {
    'results': [{
      'query': 'a',
      'index': indexName,
      'hits': [{'objectID': 'one'}],
      'nbHits': 7,
      'page': 0,
      'nbPages': 1,
      'hitsPerPage': 20,
      'facets': {
        'beers.lvl0': {'IPA': 2},
        'fruits.lvl0': {'oranges': 5}
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
        'beers.lvl0': {'IPA': 2, 'Belgian': 3}
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
        'fruits.lvl0': {'oranges': 5, 'apples': 4}
      }
    }]
  };

  var expectedHelperResponse = [{
    'name': 'beers',
    'count': null,
    'isRefined': true,
    'path': null,
    'data': [{
      'name': 'IPA',
      'path': 'IPA',
      'count': 2,
      'isRefined': true,
      'data': null
    }, {
      'name': 'Belgian',
      'path': 'Belgian',
      'count': 3,
      'isRefined': false,
      'data': null
    }]
  }, {
    'name': 'fruits',
    'path': null,
    'count': null,
    'isRefined': true,
    'data': [{
      'name': 'oranges',
      'path': 'oranges',
      'count': 5,
      'isRefined': true,
      'data': null
    }, {
      'name': 'apples',
      'path': 'apples',
      'count': 4,
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
    t.end();
  });
});
