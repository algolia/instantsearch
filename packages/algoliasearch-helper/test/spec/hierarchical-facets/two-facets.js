'use strict';

test('hierarchical facets: two hierarchical facets', function (done) {
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
        name: 'beers',
        attributes: ['beers.lvl0'],
      },
      {
        name: 'fruits',
        attributes: ['fruits.lvl0'],
      },
    ],
  });

  helper.toggleRefine('beers', 'IPA');
  helper.toggleRefine('fruits', 'oranges');

  var algoliaResponse = {
    results: [
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }],
        nbHits: 7,
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
        exhaustiveFacetsCount: true,
        facets: {
          'beers.lvl0': { IPA: 2 },
          'fruits.lvl0': { oranges: 5 },
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
          'beers.lvl0': { IPA: 2, Belgian: 3 },
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
          'fruits.lvl0': { oranges: 5, apples: 4 },
        },
      },
    ],
  };

  var expectedHelperResponse = [
    {
      name: 'beers',
      count: null,
      isRefined: true,
      path: null,
      escapedValue: null,
      exhaustive: true,
      data: [
        {
          name: 'IPA',
          path: 'IPA',
          escapedValue: 'IPA',
          count: 2,
          isRefined: true,
          exhaustive: true,
          data: null,
        },
        {
          name: 'Belgian',
          path: 'Belgian',
          escapedValue: 'Belgian',
          count: 3,
          isRefined: false,
          exhaustive: true,
          data: null,
        },
      ],
    },
    {
      name: 'fruits',
      path: null,
      escapedValue: null,
      count: null,
      isRefined: true,
      exhaustive: true,
      data: [
        {
          name: 'oranges',
          path: 'oranges',
          escapedValue: 'oranges',
          count: 5,
          isRefined: true,
          exhaustive: true,
          data: null,
        },
        {
          name: 'apples',
          path: 'apples',
          escapedValue: 'apples',
          count: 4,
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
    done();
  });
});
