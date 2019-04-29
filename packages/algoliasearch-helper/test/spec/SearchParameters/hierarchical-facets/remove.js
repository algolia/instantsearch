'use strict';

var SearchParameters = require('../../../../src/SearchParameters');

test('Should remove a refinement', function() {
  var state0 = SearchParameters.make({
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3']
    }]
  }).addHierarchicalFacetRefinement('categories', 'men');

  expect(state0.getHierarchicalRefinement('categories')).toEqual(['men']);
  var state1 = state0.removeHierarchicalFacetRefinement('categories');
  expect(state1.getHierarchicalRefinement('categories')).toEqual([]);
});

test('Should throw if there is no refinement', function() {
  var state0 = SearchParameters.make({
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3']
    }]
  });

  expect(state0.removeHierarchicalFacetRefinement.bind(state0, 'categories')).toThrow();
});

test('Should throw if the facet is not defined', function() {
  var state0 = SearchParameters.make({});

  expect(state0.removeHierarchicalFacetRefinement.bind(state0, 'categories')).toThrow();
});
