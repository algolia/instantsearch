'use strict';

var fakeClient = {};

test('hierarchical facets: getFacetValues', function () {
  var algoliasearchHelper = require('../../../');
  var SearchResults = require('../../../src/SearchResults');

  var indexName = 'hierarchical-simple-indexName';
  var helper = algoliasearchHelper(fakeClient, indexName, {
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: ['categories.lvl0', 'categories.lvl1'],
        separator: ' | ',
      },
    ],
  });

  helper.toggleRefine('categories', 'beers | IPA').setQuery('a');

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

  var expectedHelperResponseNameASC = {
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
            name: 'Belgian',
            path: 'beers | Belgian',
            escapedValue: 'beers | Belgian',
            count: 1,
            isRefined: false,
            exhaustive: true,
            data: null,
          },
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
  };

  var results = new SearchResults(helper.state, algoliaResponse.results);

  expect(
    results.getFacetValues('categories', { sortBy: ['name:asc'] })
  ).toEqual(expectedHelperResponseNameASC);
  expect(
    results.getFacetValues('categories', {
      sortBy: function (a, b) {
        return a.count - b.count;
      },
    })
  ).toEqual(results.getFacetValues('categories', { sortBy: ['count:asc'] }));
});
