'use strict';

test('hierarchical facets: simple usage', function(done) {
  var algoliasearch = require('algoliasearch');
  var isArray = require('lodash/isArray');

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-toggleRefine-appId';
  var apiKey = 'hierarchical-toggleRefine-apiKey';
  var indexName = 'hierarchical-toggleRefine-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3']
    }]
  });

  helper.toggleRefine('categories', 'beers > IPA > Flying dog');

  var algoliaResponse = {
    'results': [{
      'query': 'a',
      'index': indexName,
      'hits': [{'objectID': 'one'}],
      'nbHits': 3,
      'page': 0,
      'nbPages': 1,
      'hitsPerPage': 20,
      'exhaustiveFacetsCount': true,
      'facets': {
        'categories.lvl0': {'beers': 3, 'sales': 3},
        'categories.lvl1': {'beers > IPA': 3, 'sales > IPA': 3},
        'categories.lvl2': {'beers > IPA > Flying dog': 3, 'sales > IPA > Flying dog': 3}
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
        'categories.lvl0': {'beers': 9},
        'categories.lvl1': {'beers > IPA': 9},
        'categories.lvl2': {
          'beers > IPA > Flying dog': 3,
          'sales > IPA > Flying dog': 3,
          'beers > IPA > Brewdog punk IPA': 6
        }
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
        'categories.lvl0': {'beers': 20, 'fruits': 5, 'sales': 20}
      }
    }]
  };

  var expectedHelperResponse = [{
    'name': 'categories',
    'count': null,
    'isRefined': true,
    'path': null,
    'exhaustive': true,
    'data': [{
      'name': 'beers',
      'path': 'beers',
      'count': 9,
      'isRefined': true,
      'exhaustive': true,
      'data': [{
        'name': 'IPA',
        'path': 'beers > IPA',
        'count': 9,
        'isRefined': true,
        'exhaustive': true,
        'data': [{
          'name': 'Flying dog',
          'path': 'beers > IPA > Flying dog',
          'count': 3,
          'isRefined': true,
          'exhaustive': true,
          'data': null
        }, {
          'name': 'Brewdog punk IPA',
          'path': 'beers > IPA > Brewdog punk IPA',
          'count': 6,
          'isRefined': false,
          'exhaustive': true,
          'data': null
        }]
      }]
    }, {
      'name': 'fruits',
      'path': 'fruits',
      'count': 5,
      'isRefined': false,
      'exhaustive': true,
      'data': null
    }, {
      'name': 'sales',
      'path': 'sales',
      'count': 20,
      'isRefined': false,
      'exhaustive': true,
      'data': null
    }]
  }];

  client.search = jest.fn(function() {
    return Promise.resolve(algoliaResponse);
  });

  helper.setQuery('a').search();

  helper.once('result', function(event) {
    var queries = client.search.mock.calls[0][0];
    var hitsQuery = queries[0];
    var parentValuesQuery = queries[1];
    var rootValuesQuery = queries[2];

    expect(queries.length).toBe(3);
    expect(hitsQuery.params.facets).toEqual(
      ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3']
    );
    expect(hitsQuery.params.facetFilters).toEqual([['categories.lvl2:beers > IPA > Flying dog']]);
    expect(parentValuesQuery.params.facets).toEqual(['categories.lvl0', 'categories.lvl1', 'categories.lvl2']);
    expect(parentValuesQuery.params.facetFilters).toEqual([['categories.lvl1:beers > IPA']]);
    expect(rootValuesQuery.params.facets).toEqual(['categories.lvl0']);
    expect(rootValuesQuery.params.facetFilters).toBe(undefined);
    expect(event.results.hierarchicalFacets).toEqual(expectedHelperResponse);
    expect(event.results.getFacetByName('categories')).toEqual(expectedHelperResponse[0]);

    // we do not yet support multiple values for hierarchicalFacetsRefinements
    // but at some point we may want to open multiple leafs of a hierarchical menu
    // So we set this as an array so that we do not have to bump major to handle it
    expect(isArray(helper.state.hierarchicalFacetsRefinements.categories)).toBeTruthy();
    done();
  });
});
