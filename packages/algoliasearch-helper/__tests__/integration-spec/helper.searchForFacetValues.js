'use strict';

jest.retryTimes(3, { logErrorsBeforeRetry: true });

var utils = require('../../test/integration-utils');
var setup = utils.setupSimple;
var createIndexName = utils.createIndexName;

var algoliasearchHelper = require('../../');

var indexName = createIndexName('helper_sffv');

var dataset = [
  { objectID: '1', f: 'ba', f2: ['b'] },
  { objectID: '2', f: 'ba', f2: ['c', 'x'] },
  { objectID: '3', f: 'ba', f2: ['d'] },
  { objectID: '4', f: 'bb', f2: ['b'] },
  { objectID: '5', f: 'bb', f2: ['c', 'y'] },
];

var config = {
  attributesForFaceting: ['searchable(f)', 'searchable(f2)'],
};

var client;
beforeAll(function () {
  return setup(indexName, dataset, config).then(function (c) {
    client = c;
  });
});

test('[INT][SEARCHFORFACETVALUES] Should be able to search for facet values - conjunctive', function () {
  var helper = algoliasearchHelper(client, indexName, {
    facets: ['f', 'f2'],
  });

  return helper
    .searchForFacetValues('f', 'a')
    .then(function (content) {
      expect(content).toBeTruthy();
      expect(content.facetHits.length).toBe(0);

      return helper.searchForFacetValues('f', 'b');
    })
    .then(function (content) {
      expect(content).toBeTruthy();

      expect(content.facetHits).toEqual([
        {
          value: 'ba',
          escapedValue: 'ba',
          highlighted: '<em>b</em>a',
          count: 3,
          isRefined: false,
        },
        {
          value: 'bb',
          escapedValue: 'bb',
          highlighted: '<em>b</em>b',
          count: 2,
          isRefined: false,
        },
      ]);

      helper.addFacetRefinement('f2', 'c');

      return helper.searchForFacetValues('f', 'b');
    })
    .then(function (content) {
      expect(content).toBeTruthy();

      expect(content.facetHits).toEqual([
        {
          value: 'ba',
          escapedValue: 'ba',
          highlighted: '<em>b</em>a',
          count: 1,
          isRefined: false,
        },
        {
          value: 'bb',
          escapedValue: 'bb',
          highlighted: '<em>b</em>b',
          count: 1,
          isRefined: false,
        },
      ]);

      helper.clearRefinements().addFacetRefinement('f2', 'c');

      return helper.searchForFacetValues('f2', '');
    })
    .then(function (content) {
      expect(content).toBeTruthy();

      expect(content.facetHits).toEqual([
        {
          value: 'c',
          escapedValue: 'c',
          highlighted: 'c',
          count: 2,
          isRefined: true,
        },
        {
          value: 'x',
          escapedValue: 'x',
          highlighted: 'x',
          count: 1,
          isRefined: false,
        },
        {
          value: 'y',
          escapedValue: 'y',
          highlighted: 'y',
          count: 1,
          isRefined: false,
        },
      ]);
    });
});

test('[INT][SEARCHFORFACETVALUES] Should be able to search for facet values - disjunctive', function () {
  var helper = algoliasearchHelper(client, indexName, {
    disjunctiveFacets: ['f', 'f2'],
  });

  return helper
    .searchForFacetValues('f', 'a')
    .then(function (content) {
      expect(content).toBeTruthy();
      expect(content.facetHits.length).toBe(0);

      return helper.searchForFacetValues('f', 'b');
    })
    .then(function (content) {
      expect(content).toBeTruthy();

      expect(content.facetHits).toEqual([
        {
          value: 'ba',
          escapedValue: 'ba',
          highlighted: '<em>b</em>a',
          count: 3,
          isRefined: false,
        },
        {
          value: 'bb',
          escapedValue: 'bb',
          highlighted: '<em>b</em>b',
          count: 2,
          isRefined: false,
        },
      ]);

      helper.addDisjunctiveFacetRefinement('f2', 'd');

      return helper.searchForFacetValues('f', 'b');
    })
    .then(function (content) {
      expect(content).toBeTruthy();

      expect(content.facetHits).toEqual([
        {
          value: 'ba',
          escapedValue: 'ba',
          highlighted: '<em>b</em>a',
          count: 1,
          isRefined: false,
        },
      ]);

      helper.clearRefinements().addDisjunctiveFacetRefinement('f2', 'c');

      return helper.searchForFacetValues('f2', '');
    })
    .then(function (content) {
      expect(content).toBeTruthy();

      expect(content.facetHits).toEqual([
        {
          value: 'b',
          escapedValue: 'b',
          highlighted: 'b',
          count: 2,
          isRefined: false,
        },
        {
          value: 'c',
          escapedValue: 'c',
          highlighted: 'c',
          count: 2,
          isRefined: true,
        },
        {
          value: 'd',
          escapedValue: 'd',
          highlighted: 'd',
          count: 1,
          isRefined: false,
        },
        {
          value: 'x',
          escapedValue: 'x',
          highlighted: 'x',
          count: 1,
          isRefined: false,
        },
        {
          value: 'y',
          escapedValue: 'y',
          highlighted: 'y',
          count: 1,
          isRefined: false,
        },
      ]);
    });
});

test('[INT][SEARCHFORFACETVALUES] Should be able to limit the number of returned items', function () {
  var helper = algoliasearchHelper(client, indexName, {
    facets: ['f', 'f2'],
  });

  return helper.searchForFacetValues('f', 'b', 1).then(function (content) {
    expect(content.facetHits.length).toBeTruthy();

    expect(content.facetHits).toEqual([
      {
        value: 'ba',
        escapedValue: 'ba',
        highlighted: '<em>b</em>a',
        count: 3,
        isRefined: false,
      },
    ]);
  });
});
