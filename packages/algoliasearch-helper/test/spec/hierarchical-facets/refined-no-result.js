'use strict';

test('hierarchical facets: no results', function (done) {
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

  helper.toggleFacetRefinement('categories', 'beers > IPA > Flying dog');

  var algoliaResponse = {
    results: [
      {
        query: 'badquery',
        index: indexName,
        hits: [],
        nbHits: 0,
        page: 0,
        nbPages: 0,
        hitsPerPage: 6,
        exhaustiveFacetsCount: true,
        facets: {},
      },
      {
        query: 'badquery',
        index: indexName,
        hits: [],
        nbHits: 0,
        page: 0,
        nbPages: 0,
        hitsPerPage: 1,
        facets: {
          'categories.lvl0': { beers: 20, fruits: 5, sales: 20 },
        },
      },
      {
        query: 'badquery',
        index: indexName,
        hits: [],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 1,
        facets: {
          'categories.lvl0': { beers: 20, fruits: 5, sales: 20 },
        },
      },
    ],
  };

  client.search = jest.fn(function () {
    return Promise.resolve(algoliaResponse);
  });

  helper.setQuery('badquery').search();

  helper.once('result', function (event) {
    expect(event.results.hierarchicalFacets).toEqual([
      {
        name: 'categories',
        count: null,
        isRefined: true,
        path: null,
        escapedValue: null,
        exhaustive: true,
        data: null,
      },
    ]);
    done();
  });
});
