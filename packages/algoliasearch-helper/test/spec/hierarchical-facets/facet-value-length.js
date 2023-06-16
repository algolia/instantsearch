'use strict';

test('hierarchical facets: facet value called length', function (done) {
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
        attributes: ['categories.lvl0'],
      },
    ],
  });

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
          // value length can cause lodash to turn an object into an array
          'categories.lvl0': { beers: 8, length: 3 },
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
          count: 8,
          isRefined: false,
          exhaustive: true,
          data: null,
        },
        {
          name: 'length',
          path: 'length',
          escapedValue: 'length',
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

  helper.search();
  helper.once('result', function (event) {
    expect(event.results.hierarchicalFacets).toEqual(expectedHelperResponse);
    done();
  });
});
