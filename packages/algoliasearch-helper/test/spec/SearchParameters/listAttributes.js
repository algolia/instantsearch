'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('addFacet should add a facet to the facets list', function () {
  var state = SearchParameters.make({}).addFacet('facet');

  expect(state.facets).toEqual(['facet']);
});

test('addDisjunctiveFacet should add a facet to the disjunctiveFacets list', function () {
  var state = SearchParameters.make({}).addDisjunctiveFacet('facet');

  expect(state.disjunctiveFacets).toEqual(['facet']);
});

test('addHierarchicalFacet should add a facet to the hierarchicalFacets list', function () {
  var state = SearchParameters.make({}).addHierarchicalFacet({ name: 'facet' });

  expect(state.hierarchicalFacets).toEqual([{ name: 'facet' }]);
});

test('addHierarchicalFacet should throw when a facet with the same name is already declared', function () {
  expect(function () {
    SearchParameters.make({
      hierarchicalFacets: [{ name: 'facet' }],
    }).addHierarchicalFacet({ name: 'facet' });
  }).toThrow();
});

test('removeHierarchicalFacet should remove a facet from the hierarchicalFacets list', function () {
  var state = SearchParameters.make({})
    .addHierarchicalFacet({ name: 'facet' })
    .removeHierarchicalFacet('facet');

  expect(state.hierarchicalFacets).toEqual([]);

  state = SearchParameters.make({})
    .addHierarchicalFacet({ name: 'facet' })
    .toggleHierarchicalFacetRefinement('facet', 'value')
    .removeHierarchicalFacet('facet');

  expect(state.hierarchicalFacetsRefinements).toEqual({});
});
