'use strict';

var test = require('tape');
var SearchParameters = require('../../../../src/SearchParameters');

test('Should add a refinement', function(t) {
  var state0 = SearchParameters.make({
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3']
    }]
  });

  t.deepEqual(state0.getHierarchicalRefinement('categories'), []);
  var state1 = state0.addHierarchicalFacetRefinement('categories', 'men');
  t.deepEqual(state1.getHierarchicalRefinement('categories'), ['men']);

  t.end();
});

test('Should throw if there is already a refinement', function(t) {
  var state0 = SearchParameters.make({
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3']
    }]
  });

  t.deepEqual(state0.getHierarchicalRefinement('categories'), []);
  var state1 = state0.toggleHierarchicalFacetRefinement('categories', 'beers');
  t.throws(state1.addHierarchicalFacetRefinement.bind(state1, 'categories', 'men'));

  t.end();
});

test('Should throw if the facet is not defined', function(t) {
  var state0 = SearchParameters.make({});

  t.throws(state0.addHierarchicalFacetRefinement.bind(state0, 'categories', 'men'));

  t.end();
});
