'use strict';

var test = require('tape');
var SearchParameters = require('../../../../src/SearchParameters');

test('Should remove a refinement', function(t) {
  var state0 = SearchParameters.make({
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3']
    }]
  }).addHierarchicalFacetRefinement('categories', 'men');

  t.deepEqual(state0.getHierarchicalRefinement('categories'), ['men']);
  var state1 = state0.removeHierarchicalFacetRefinement('categories');
  t.deepEqual(state1.getHierarchicalRefinement('categories'), []);

  t.end();
});

test('Should throw if there is no refinement', function(t) {
  var state0 = SearchParameters.make({
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3']
    }]
  });

  t.throws(state0.removeHierarchicalFacetRefinement.bind(state0, 'categories'));

  t.end();
});

test('Should throw if the facet is not defined', function(t) {
  var state0 = SearchParameters.make({});

  t.throws(state0.removeHierarchicalFacetRefinement.bind(state0, 'categories'));

  t.end();
});
