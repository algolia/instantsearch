'use strict';

var SearchParameters = require('../../../src/SearchParameters');
var SearchResults = require('../../../src/SearchResults');

// the sort is only count based so that a change in the order of the keys
// isn't hidden by the refined value being moved to the top
function getRootNames(refinement, mainRoot, rootResponse, persist) {
  var state = new SearchParameters({
    index: 'indexName',
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: ['categories.lvl0', 'categories.lvl1'],
        sortBy: ['count:desc'],
      },
    ],
    hierarchicalFacetsRefinements: refinement
      ? { categories: [refinement] }
      : {},
  });

  var results = [
    {
      hits: [],
      facets: {
        'categories.lvl0': mainRoot,
        'categories.lvl1': refinement ? { 'sales > IPA': 5 } : {},
      },
    },
  ];
  if (refinement) {
    results.push(
      {
        hits: [],
        facets: {
          'categories.lvl0': rootResponse,
          'categories.lvl1': { 'sales > IPA': 5 },
        },
      },
      { hits: [], facets: { 'categories.lvl0': rootResponse } }
    );
  }

  return new SearchResults(state, results, {
    persistHierarchicalRootCount: persist,
  })
    .getFacetValues('categories', { sortBy: ['count:desc'] })
    .data.map(function (v) {
      return v.name;
    });
}

describe('hierarchical facet values with the same count', function () {
  var tied = { beers: 20, sales: 20, fruits: 5 };

  describe.each([[false], [true]])(
    'persistHierarchicalRootCount: %s',
    function (persist) {
      test('keep their order when nothing is selected', function () {
        expect(getRootNames(undefined, tied, tied, persist)).toEqual([
          'beers',
          'sales',
          'fruits',
        ]);
      });

      test('keep their order when selecting the second one', function () {
        expect(
          getRootNames('sales > IPA', { sales: 20 }, tied, persist)
        ).toEqual(['beers', 'sales', 'fruits']);
      });

      test('keep their order when the main count is lower', function () {
        expect(
          getRootNames('sales > IPA', { sales: 5 }, tied, persist)
        ).toEqual(['beers', 'sales', 'fruits']);
      });

      test('keep their order when selecting a lower count', function () {
        expect(
          getRootNames('fruits > IPA', { fruits: 5 }, tied, persist)
        ).toEqual(['beers', 'sales', 'fruits']);
      });
    }
  );

  // with persistHierarchicalRootCount: false the refined root is re-added
  // last by defaultsPure, which isn't covered here
  test('keep their order when selecting the first one', function () {
    expect(getRootNames('beers > IPA', { beers: 20 }, tied, true)).toEqual([
      'beers',
      'sales',
      'fruits',
    ]);
  });
});
