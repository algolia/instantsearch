'use strict';

var test = require('tape');

test('hierarchical facets: no refinement', function(t) {
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
      attributes: ['categories.lvl0']
    }]
  });

  var algoliaResponse = {
    'results': [{
      'query': 'a',
      'index': indexName,
      'hits': [{'objectID': 'one'}, {'objectID': 'two'}],
      'nbHits': 5,
      'page': 0,
      'nbPages': 1,
      'hitsPerPage': 20,
      'facets': {
        'categories.lvl0': {'beers': 2, 'fruits': 3}
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
      'count': 2,
      'isRefined': false,
      'data': null
    }, {
      'name': 'fruits',
      'path': 'fruits',
      'count': 3,
      'isRefined': false,
      'data': null
    }]
  }];

  client.search = sinon
    .stub()
    .resolves(algoliaResponse);

  helper.setQuery('a').search();
  helper.once('result', function(content) {
    var call = client.search.getCall(0);
    var queries = call.args[0];
    var hitsQuery = queries[0];

    t.equal(queries.length, 1, 'we made one query');
    t.ok(client.search.calledOnce, 'client.search was called once');
    t.deepEqual(
      hitsQuery.params.facets,
      ['categories.lvl0'],
      'first query (hits) has `categories.lvl0` as facets'
    );
    t.equal(
      hitsQuery.params.facetFilters,
      undefined,
      'first query (hits) has no facet refinement refinement'
    );
    t.deepEqual(content.hierarchicalFacets, expectedHelperResponse);
    t.end();
  });
});
