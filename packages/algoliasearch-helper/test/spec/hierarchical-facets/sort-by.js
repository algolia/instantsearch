'use strict';

test('hierarchical facets: using sortBy', function (done) {
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
        attributes: [
          'categories.lvl0',
          'categories.lvl1',
          'categories.lvl2',
          'categories.lvl3',
        ],
        sortBy: ['count:desc', 'name:asc'],
      },
    ],
  });

  helper.toggleRefine('categories', 'beers > IPA > Flying dog');

  var algoliaResponse = {
    results: [
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
        exhaustiveFacetsCount: true,
        facets: {
          'categories.lvl0': { beers: 1 },
          'categories.lvl1': { 'beers > IPA': 1 },
          'categories.lvl2': { 'beers > IPA > Flying dog': 1 },
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
          'categories.lvl0': { beers: 5 },
          'categories.lvl1': { 'beers > IPA': 5 },
          'categories.lvl2': {
            'beers > IPA > Flying dog': 1,
            'beers > IPA > Anchor steam': 1,
            'beers > IPA > Brewdog punk IPA': 3,
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
          'categories.lvl0': { beers: 5 },
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
              count: 5,
              isRefined: true,
              exhaustive: true,
              data: [
                {
                  name: 'Brewdog punk IPA',
                  path: 'beers > IPA > Brewdog punk IPA',
                  escapedValue: 'beers > IPA > Brewdog punk IPA',
                  count: 3,
                  isRefined: false,
                  exhaustive: true,
                  data: null,
                },
                {
                  name: 'Anchor steam',
                  path: 'beers > IPA > Anchor steam',
                  escapedValue: 'beers > IPA > Anchor steam',
                  count: 1,
                  isRefined: false,
                  exhaustive: true,
                  data: null,
                },
                {
                  name: 'Flying dog',
                  path: 'beers > IPA > Flying dog',
                  escapedValue: 'beers > IPA > Flying dog',
                  count: 1,
                  isRefined: true,
                  exhaustive: true,
                  data: null,
                },
              ],
            },
          ],
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
