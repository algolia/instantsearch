'use strict';

var SearchParameters = require('../../../../src/SearchParameters');

test('Should add a refinement', function () {
  var state0 = SearchParameters.make({
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: [
          'categories.lvl0',
          'categories.lvl1',
          'categories.lvl2',
          'categories.lvl3',
        ],
      },
    ],
  });

  expect(state0.getHierarchicalRefinement('categories')).toEqual([]);
  var state1 = state0.addHierarchicalFacetRefinement('categories', 'men');
  expect(state1.getHierarchicalRefinement('categories')).toEqual(['men']);
});

test('Should throw if there is already a refinement', function () {
  var state0 = SearchParameters.make({
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: [
          'categories.lvl0',
          'categories.lvl1',
          'categories.lvl2',
          'categories.lvl3',
        ],
      },
    ],
  });

  expect(state0.getHierarchicalRefinement('categories')).toEqual([]);
  var state1 = state0.toggleHierarchicalFacetRefinement('categories', 'beers');
  expect(
    state1.addHierarchicalFacetRefinement.bind(state1, 'categories', 'men')
  ).toThrow();
});

test('Should throw if the facet is not defined', function () {
  var state0 = SearchParameters.make({});

  expect(
    state0.addHierarchicalFacetRefinement.bind(state0, 'categories', 'men')
  ).toThrow();
});
