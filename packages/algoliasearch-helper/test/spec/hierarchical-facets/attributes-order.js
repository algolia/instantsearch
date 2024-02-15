// This file tests a specific bug that occurs when the API returns facets data for hierarchical attributes in a
// different order than the declared attributes order at the helper initialization
'use strict';

test('hierarchical facets: attributes order', function (done) {
  var algoliasearch = require('algoliasearch');

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-toggleRefine-appId';
  var apiKey = 'hierarchical-toggleRefine-apiKey';
  var indexName = 'hierarchical-toggleRefine-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: ['categories.lvl0', 'categories.lvl1'],
      },
    ],
  });

  helper.toggleFacetRefinement('categories', 'beers');

  var algoliaResponse = {
    results: [
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }],
        nbHits: 3,
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
        exhaustiveFacetsCount: true,
        facets: {
          // /!\ Note that lvl1 comes *before* lvl0 here
          'categories.lvl1': { 'beers > IPA': 6, 'beers > 1664': 3 },
          'categories.lvl0': { beers: 9 },
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
          'categories.lvl0': { beers: 9, fruits: 5, sales: 20 },
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
          count: 9,
          isRefined: true,
          exhaustive: true,
          data: [
            {
              name: '1664',
              path: 'beers > 1664',
              escapedValue: 'beers > 1664',
              count: 3,
              isRefined: false,
              exhaustive: true,
              data: null,
            },
            {
              name: 'IPA',
              path: 'beers > IPA',
              escapedValue: 'beers > IPA',
              count: 6,
              isRefined: false,
              exhaustive: true,
              data: null,
            },
          ],
        },
        {
          name: 'fruits',
          path: 'fruits',
          escapedValue: 'fruits',
          count: 5,
          isRefined: false,
          exhaustive: true,
          data: null,
        },
        {
          name: 'sales',
          path: 'sales',
          escapedValue: 'sales',
          count: 20,
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
    expect(event.results.hierarchicalFacets).toEqual(expectedHelperResponse);
    expect(event.results.getFacetByName('categories')).toEqual(
      expectedHelperResponse[0]
    );

    done();
  });
});
