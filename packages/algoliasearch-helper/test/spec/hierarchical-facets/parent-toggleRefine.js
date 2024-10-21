'use strict';

test('hierarchical facets: toggleFacetRefinement behavior', function () {
  var algoliasearch = require('algoliasearch');
  algoliasearch = algoliasearch.algoliasearch || algoliasearch;

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-toggleFacetRefinement-appId';
  var apiKey = 'hierarchical-toggleFacetRefinement-apiKey';
  var indexName = 'hierarchical-toggleFacetRefinement-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: [
          'categories.lvl0',
          'categories.lvl1',
          'categories.lvl2',
          'categories.lvl3',
        ],
      },
    ],
  });

  client.search = jest.fn(function () {
    return new Promise(function () {});
  });

  // select `Flying dog`
  helper.toggleFacetRefinement('categories', 'beers > IPA > Flying dog');

  // unselect `beers`
  helper.toggleFacetRefinement('categories', 'beers');

  // select `beers`
  helper.toggleFacetRefinement('categories', 'beers');
  // we should be on `beers`

  helper.setQuery('a').search();

  var queries = client.search.mock.calls[0][0];
  var hitsQuery = queries[0];

  expect(hitsQuery.params.facets).toEqual([
    'categories.lvl0',
    'categories.lvl1',
  ]);
  expect(hitsQuery.params.facetFilters).toEqual([['categories.lvl0:beers']]);
});

test('hierarchical facets: toggleFacetRefinement behavior when root level', function () {
  var algoliasearch = require('algoliasearch');
  algoliasearch = algoliasearch.algoliasearch || algoliasearch;

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-toggleFacetRefinement-appId';
  var apiKey = 'hierarchical-toggleFacetRefinement-apiKey';
  var indexName = 'hierarchical-toggleFacetRefinement-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: [
          'categories.lvl0',
          'categories.lvl1',
          'categories.lvl2',
          'categories.lvl3',
        ],
      },
    ],
  });

  client.search = jest.fn(function () {
    return new Promise(function () {});
  });

  helper.toggleFacetRefinement('categories', 'beers > IPA > Flying dog');
  helper.toggleFacetRefinement('categories', 'beers');
  // we should be on ``

  helper.setQuery('a').search();

  var queries = client.search.mock.calls[0][0];
  var hitsQuery = queries[0];

  expect(hitsQuery.params.facets).toEqual(['categories.lvl0']);
  expect(hitsQuery.params.facetFilters).toBe(undefined);
});

test('hierarchical facets: toggleFacetRefinement behavior when different root level', function () {
  var algoliasearch = require('algoliasearch');
  algoliasearch = algoliasearch.algoliasearch || algoliasearch;

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-toggleFacetRefinement-appId';
  var apiKey = 'hierarchical-toggleFacetRefinement-apiKey';
  var indexName = 'hierarchical-toggleFacetRefinement-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: [
          'categories.lvl0',
          'categories.lvl1',
          'categories.lvl2',
          'categories.lvl3',
        ],
      },
    ],
  });

  client.search = jest.fn(function () {
    return new Promise(function () {});
  });

  helper.toggleFacetRefinement('categories', 'beers > IPA > Flying dog');
  helper.toggleFacetRefinement('categories', 'fruits');
  // we should be on `fruits`

  helper.setQuery('a').search();

  var queries = client.search.mock.calls[0][0];
  var hitsQuery = queries[0];

  expect(hitsQuery.params.facets).toEqual([
    'categories.lvl0',
    'categories.lvl1',
  ]);
  expect(hitsQuery.params.facetFilters).toEqual([['categories.lvl0:fruits']]);
});
