'use strict';

var algoliaSearchHelper = require('../../../');

var fakeClient = {};

test('addFacetRefinement keeps the order of refinements', function() {
  var helper = algoliaSearchHelper(fakeClient, null, {
    facets: ['facet1', 'facet2']
  });

  helper.addFacetRefinement('facet1', 'facetValue');
  helper.addFacetRefinement('facet2', 'facetValue');

  expect(helper.state.facets).toEqual(['facet1', 'facet2']);
  expect(helper.state.facetsRefinements).toEqual({
    facet1: ['facetValue'],
    facet2: ['facetValue']
  });
  expect(Object.keys(helper.state.facetsRefinements)).toEqual(['facet1', 'facet2']);
});
