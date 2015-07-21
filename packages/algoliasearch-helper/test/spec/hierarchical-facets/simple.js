'use strict';

var test = require('tape');

test('hierarchical facets: simple usage', function(t) {
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
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3']
    }]
  });

  helper.toggleRefine('categories', 'beers > IPA > Flying dog');

  var search = sinon.stub(client, 'search');

  var algoliaResponse = {
    'results': [{
      'query': 'a',
      'index': indexName,
      'hits': [{'objectID': 'one'}],
      'nbHits': 1,
      'page': 0,
      'nbPages': 1,
      'hitsPerPage': 20,
      'facets': {
        'categories.lvl0': {'beers': 1},
        'categories.lvl1': {'beers > IPA': 1},
        'categories.lvl2': {'beers > IPA > Flying dog': 1}
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
        'categories.lvl0': {'beers': 2},
        'categories.lvl1': {'beers > IPA': 2},
        'categories.lvl2': {'beers > IPA > Flying dog': 1, 'beers > IPA > Anchor steam': 1}
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
      'isRefined': true,
      'data': [{
        'name': 'IPA',
        'path': 'beers > IPA',
        'count': 2,
        'isRefined': true,
        'data': [{
          'name': 'Flying dog',
          'path': 'beers > IPA > Flying dog',
          'count': 1,
          'isRefined': true,
          'data': null
        }, {
          'name': 'Anchor steam',
          'path': 'beers > IPA > Anchor steam',
          'count': 1,
          'isRefined': false,
          'data': null
        }]
      }]
    }]
  }];

  search.yieldsAsync(null, algoliaResponse);
  helper.setQuery('a').search();
  helper.once('result', function(content) {
    var call = search.getCall(0);
    var queries = call.args[0];
    var hitsQuery = queries[0];
    var parentFacetValuesQuery = queries[1];

    t.equal(queries.length, 2, 'we made two queries');
    t.ok(search.calledOnce, 'client.search was called once');
    t.deepEqual(
      hitsQuery.params.facets,
      ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3'],
      'first query (hits) has `categories.lvl0, categories.lvl1, categories.lvl2, categories.lvl3` as facets'
    );
    t.deepEqual(
      hitsQuery.params.facetFilters,
      [['categories.lvl2:beers > IPA > Flying dog']],
      'first query (hits) has our `categories.lvl2` refinement facet filter'
    );
    t.deepEqual(
      parentFacetValuesQuery.params.facets,
      ['categories.lvl2'],
      'second query (unrefined parent facet values) has `categories.lvl2` as facets'
    );
    t.deepEqual(
      parentFacetValuesQuery.params.facetFilters,
      [['categories.lvl1:beers > IPA']],
      'second query (unrefined parent facet values) has `categories.lvl1` (parent level) refined'
    );
    // console.log(JSON.stringify(content.hierarchicalFacets, null, 2))
    t.deepEqual(content.hierarchicalFacets, expectedHelperResponse);
    t.end();
  });
});
