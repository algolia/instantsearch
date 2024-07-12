'use strict';

test('hierarchical facets: objects with multiple categories', function (done) {
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
        attributes: ['categories.lvl0', 'categories.lvl1'],
      },
    ],
  });

  helper.toggleRefine('categories', 'beers > IPA');

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
          'categories.lvl0': { beers: 3, bières: 3 },
          'categories.lvl1': { 'beers > IPA': 3, 'bières > Rousses': 3 },
        },
      },
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
        facets: {
          'categories.lvl0': { beers: 5, bières: 3 },
          'categories.lvl1': {
            'beers > IPA': 3,
            'beers > Guiness': 2,
            'bières > Rousses': 3,
          },
        },
      },
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
        facets: {
          'categories.lvl0': { beers: 5, bières: 3 },
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
          count: 5,
          isRefined: true,
          exhaustive: true,
          data: [
            {
              name: 'IPA',
              path: 'beers > IPA',
              escapedValue: 'beers > IPA',
              count: 3,
              isRefined: true,
              exhaustive: true,
              data: null,
            },
            {
              name: 'Guiness',
              path: 'beers > Guiness',
              escapedValue: 'beers > Guiness',
              count: 2,
              isRefined: false,
              exhaustive: true,
              data: null,
            },
          ],
        },
        {
          name: 'bières',
          path: 'bières',
          escapedValue: 'bières',
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
    expect(event.results.hierarchicalFacets).toEqual(expectedHelperResponse);
    done();
  });
});
