'use strict';

test('hierarchical facets: do not show parent level', function (done) {
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
        separator: ' | ',
        showParentLevel: false,
      },
    ],
  });

  helper.toggleRefine('categories', 'beers | IPA');

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
          'categories.lvl1': { 'beers | IPA': 2 },
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
          'categories.lvl0': { beers: 3 },
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
          count: 3,
          isRefined: true,
          exhaustive: true,
          data: [
            {
              name: 'IPA',
              path: 'beers | IPA',
              escapedValue: 'beers | IPA',
              count: 2,
              isRefined: true,
              exhaustive: true,
              data: null,
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
    expect(client.search).toHaveBeenCalledTimes(1);
    expect(event.results.hierarchicalFacets).toEqual(expectedHelperResponse);
    done();
  });
});

test('hierarchical facets: do not show parent level hides siblings sharing a prefix', function () {
  var SearchParameters = require('../../../src/SearchParameters');
  var SearchResults = require('../../../src/SearchResults');

  var lvl0 = { beers: 3 };
  var lvl1 = { 'beers | IPA': 2, 'beers | IPA Black': 1 };
  var result = {
    hits: [],
    nbHits: 3,
    page: 0,
    nbPages: 1,
    hitsPerPage: 20,
    exhaustiveFacetsCount: true,
    facets: { 'categories.lvl0': lvl0, 'categories.lvl1': lvl1 },
  };

  function getChildren(refinement) {
    var state = new SearchParameters({
      hierarchicalFacets: [
        {
          name: 'categories',
          attributes: ['categories.lvl0', 'categories.lvl1'],
          separator: ' | ',
          showParentLevel: false,
        },
      ],
    }).toggleFacetRefinement('categories', refinement);
    var results = new SearchResults(state, [
      result,
      { facets: { 'categories.lvl0': lvl0, 'categories.lvl1': lvl1 } },
      { facets: { 'categories.lvl0': lvl0 } },
    ]);

    return results.hierarchicalFacets[0].data[0].data.map(function (facet) {
      return facet.path;
    });
  }

  expect(getChildren('beers | IPA')).toEqual(['beers | IPA']);
  expect(getChildren('beers | IPA Black')).toEqual(['beers | IPA Black']);
});
