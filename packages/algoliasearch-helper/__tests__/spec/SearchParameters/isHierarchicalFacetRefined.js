'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('isHierarchicalFacetRefined returns true if value in hierarchicalFacetsRefinements', function () {
  var state = new SearchParameters({
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: ['categories.lvl0', 'categories.lvl1'],
        separator: ' | ',
      },
    ],
    hierarchicalFacetsRefinements: {
      categories: ['beers | fancy ones'],
    },
  });

  expect(
    state.isHierarchicalFacetRefined('categories', 'beers | fancy ones')
  ).toBe(true);
});

test('isHierarchicalFacetRefined returns true if something is refined when not passing a value', function () {
  var state = new SearchParameters({
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: ['categories.lvl0', 'categories.lvl1'],
        separator: ' | ',
      },
    ],
    hierarchicalFacetsRefinements: {
      categories: ['beers | fancy ones'],
    },
  });

  expect(state.isHierarchicalFacetRefined('categories')).toBe(true);
});

test('isHierarchicalFacetRefined returns false if value not in hierarchicalFacetsRefinements', function () {
  var state = new SearchParameters({
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: ['categories.lvl0', 'categories.lvl1'],
        separator: ' | ',
      },
    ],
    hierarchicalFacetsRefinements: {
      categories: ['beers | fancy ones'],
    },
  });

  expect(
    state.isHierarchicalFacetRefined('categories', 'beers | cheap ones')
  ).toBe(false);
});

test('isHierarchicalFacetRefined returns false if facet is not hierarchical', function () {
  var state = new SearchParameters({
    hierarchicalFacetsRefinements: {
      categories: ['beers | fancy ones'],
    },
  });

  expect(
    state.isHierarchicalFacetRefined('categories', 'beers | fancy ones')
  ).toBe(false);
});
