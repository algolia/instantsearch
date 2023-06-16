'use strict';

test('hierarchical facets: custom prefix path', function (done) {
  var algoliasearch = require('algoliasearch');

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-simple-appId';
  var apiKey = 'hierarchical-simple-apiKey';
  var indexName = 'hierarchical-simple-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2'],
        rootPath: 'beers',
        separator: ' | ',
      },
    ],
  });

  helper.toggleRefine('categories', 'beers | Belgian');

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
          'categories.lvl0': { beers: 3 },
          'categories.lvl1': { 'beers | IPA': 2, 'beers | Belgian': 1 },
          'categories.lvl2': {
            'beers | Belgian | Blond': 2,
            'beers | Belgian | Dark': 1,
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
        hitsPerPage: 1,
        facets: {
          'categories.lvl0': { beers: 3 },
          'categories.lvl1': { 'beers | IPA': 2, 'beers | Belgian': 1 },
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
          'categories.lvl1': { 'beers | IPA': 2, 'beers | Belgian': 1 },
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
          name: 'Belgian',
          path: 'beers | Belgian',
          escapedValue: 'beers | Belgian',
          count: 1,
          isRefined: true,
          exhaustive: true,
          data: [
            {
              name: 'Blond',
              path: 'beers | Belgian | Blond',
              escapedValue: 'beers | Belgian | Blond',
              count: 2,
              isRefined: false,
              exhaustive: true,
              data: null,
            },
            {
              name: 'Dark',
              path: 'beers | Belgian | Dark',
              escapedValue: 'beers | Belgian | Dark',
              count: 1,
              isRefined: false,
              exhaustive: true,
              data: null,
            },
          ],
        },
        {
          name: 'IPA',
          path: 'beers | IPA',
          escapedValue: 'beers | IPA',
          count: 2,
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
    expect(client.search).toHaveBeenCalledTimes(1);
    expect(event.results.hierarchicalFacets).toEqual(expectedHelperResponse);
    done();
  });
});
