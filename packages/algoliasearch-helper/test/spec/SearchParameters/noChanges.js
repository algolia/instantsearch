'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('[No changes] setHitsPerPage', function() {
  var state = SearchParameters.make({
    hitsPerPage: 2
  });

  expect(state.setHitsPerPage(2)).toBe(state);
});

test('[No changes] setTypoTolerance', function() {
  var state = SearchParameters.make({
    typoTolerance: true
  });

  expect(state.setTypoTolerance(true)).toBe(state);
});

test('[No changes] setPage', function() {
  var state = SearchParameters.make({
    page: 2
  });

  expect(state.setPage(2)).toBe(state);
});

test('[No changes] setQuery', function() {
  var state = SearchParameters.make({
    query: 'query'
  });

  expect(state.setQuery('query')).toBe(state);
});

test('[No changes] addFacet', function() {
  var state = SearchParameters.make({}).addFacet('facet');

  expect(state.addFacet('facet')).toBe(state);
});

test('[No changes] removeFacet', function() {
  var state = SearchParameters.make({});

  expect(state.removeFacet('facet')).toBe(state);
});

test('[No changes] addDisjunctiveFacet', function() {
  var state = SearchParameters.make({}).addDisjunctiveFacet('facet');

  expect(state.addDisjunctiveFacet('facet')).toBe(state);
});

test('[No changes] removeDisjunctiveFacet', function() {
  var state = SearchParameters.make({});

  expect(state.removeDisjunctiveFacet('facet')).toBe(state);
});

test('[No changes] removeHierarchicalFacet', function() {
  var state = SearchParameters.make({});

  expect(state.removeHierarchicalFacet('facet')).toBe(state);
});

test('[No changes] addTagRefinement', function() {
  var state = SearchParameters.make({}).addTagRefinement('tag');

  expect(state.addTagRefinement('tag')).toBe(state);
});

test('[No changes] clearTags', function() {
  var state = SearchParameters.make({
    query: 'query'
  });

  expect(state.clearTags()).toBe(state);
});

test('[No changes] addDisjunctiveFacetRefinement', function() {
  var state = SearchParameters.make({
    disjunctiveFacets: ['facet']
  }).addDisjunctiveFacetRefinement('facet', 'value');

  expect(state.addDisjunctiveFacetRefinement('facet', 'value')).toBe(state);
});

test('[No changes] removeDisjunctiveFacetRefinement', function() {
  var state = SearchParameters.make({
    disjunctiveFacets: ['facet']
  });

  expect(state.removeDisjunctiveFacetRefinement('facet', 'value')).toBe(state);
});

test('[No changes] addFacetRefinement', function() {
  var state = SearchParameters.make({
    facets: ['facet']
  }).addFacetRefinement('facet', 'value');

  expect(state.addFacetRefinement('facet', 'value')).toBe(state);
});

test('[No changes] addNumericRefinement', function() {
  var state = SearchParameters.make({}).addNumericRefinement('attribute', '>', 0);

  expect(state.addNumericRefinement('attribute', '>', 0)).toBe(state);
});

test('[No changes] removeNumericRefinement', function() {
  var state = SearchParameters.make({});

  expect(state.removeNumericRefinement('attribute', '>')).toBe(state);
});

test('[No changes] setQueryParameter', function() {
  var state = SearchParameters.make({
    minWordSizefor1Typo: 50
  });

  expect(state.setQueryParameter('minWordSizefor1Typo', 50)).toBe(state);
});
