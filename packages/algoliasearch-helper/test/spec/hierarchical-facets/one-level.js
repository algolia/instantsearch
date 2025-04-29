'use strict';

test('hierarchical facets: only one level deep', function (done) {
  var algoliasearch = require('algoliasearch');
  algoliasearch = algoliasearch.algoliasearch || algoliasearch;

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-simple-appId';
  var apiKey = 'hierarchical-simple-apiKey';
  var indexName = 'hierarchical-simple-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: ['categories.lvl0'],
      },
    ],
  });

  helper.toggleRefine('categories', 'beers');

  var algoliaResponse = {
    results: [
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }, { objectID: 'two' }],
        nbHits: 2,
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
        exhaustiveFacetsCount: true,
        facets: {
          'categories.lvl0': { beers: 2 },
        },
      },
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 1,
        facets: {
          'categories.lvl0': { beers: 2, fruits: 3 },
        },
      },
    ],
  };

  var expectedHelperResponse = [
    {
      name: 'categories',
      count: null,
      isRefined: true,
      path: null,
      escapedValue: null,
      exhaustive: true,
      data: [
        {
          name: 'beers',
          path: 'beers',
          escapedValue: 'beers',
          count: 2,
          isRefined: true,
          exhaustive: true,
          data: null,
        },
        {
          name: 'fruits',
          path: 'fruits',
          escapedValue: 'fruits',
          count: 3,
          isRefined: false,
          exhaustive: true,
          data: null,
        },
      ],
    },
  ];

  client.search = jest.fn(function () {
    return Promise.resolve(algoliaResponse);
  });

  helper.setQuery('a').search();
  helper.once('result', function (event) {
    var queries = client.search.mock.calls[0][0];
    var hitsQuery = queries[0];
    var parentValuesQuery = queries[1];

    expect(queries.length).toBe(2);
    expect(client.search).toHaveBeenCalledTimes(1);
    expect(hitsQuery.params.facets).toEqual(['categories.lvl0']);
    expect(hitsQuery.params.facetFilters).toEqual([['categories.lvl0:beers']]);
    expect(parentValuesQuery.params.facets).toEqual(['categories.lvl0']);
    expect(parentValuesQuery.params.facetFilters).toBe(undefined);
    expect(event.results.hierarchicalFacets).toEqual(expectedHelperResponse);
    done();
  });
});
