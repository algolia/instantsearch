'use strict';

var test = require('tape');

var SearchParameters = require('../../../src/SearchParameters');

test('[No changes] setHitsPerPage', function(t) {
  var state = SearchParameters.make({
    hitsPerPage: 2
  });

  t.equal(state.setHitsPerPage(2), state, 'setHitsPerPage should return the same instance');

  t.end();
});

test('[No changes] setTypoTolerance', function(t) {
  var state = SearchParameters.make({
    typoTolerance: true
  });

  t.equal(state.setTypoTolerance(true), state, 'setTypoTolerance should return the same instance');

  t.end();
});

test('[No changes] setPage', function(t) {
  var state = SearchParameters.make({
    page: 2
  });

  t.equal(state.setPage(2), state, 'setPage should return the same instance');

  t.end();
});

test('[No changes] setQuery', function(t) {
  var state = SearchParameters.make({
    query: 'query'
  });

  t.equal(state.setQuery('query'), state, 'setQuery should return the same instance');

  t.end();
});

test('[No changes] addFacet', function(t) {
  var state = SearchParameters.make({}).addFacet('facet');

  t.equal(state.addFacet('facet'), state, 'addFacet should return the same instance');

  t.end();
});

test('[No changes] removeFacet', function(t) {
  var state = SearchParameters.make({});

  t.equal(state.removeFacet('facet'), state, 'removeFacet should return the same instance');

  t.end();
});

test('[No changes] addDisjunctiveFacet', function(t) {
  var state = SearchParameters.make({}).addDisjunctiveFacet('facet');

  t.equal(state.addDisjunctiveFacet('facet'), state, 'addDisjunctiveFacet should return the same instance');

  t.end();
});

test('[No changes] removeDisjunctiveFacet', function(t) {
  var state = SearchParameters.make({});

  t.equal(state.removeDisjunctiveFacet('facet'), state, 'removeDisjunctiveFacet should return the same instance');

  t.end();
});

test('[No changes] addHierarchicalFacet', function(t) {
  var state = SearchParameters.make({}).addHierarchicalFacet({name: 'facet'});

  t.equal(state.addHierarchicalFacet({name: 'facet'}), state, 'addHierarchicalFacet should return the same instance');

  t.end();
});

test('[No changes] removeHierarchicalFacet', function(t) {
  var state = SearchParameters.make({});

  t.equal(state.removeHierarchicalFacet('facet'), state, 'removeHierarchicalFacet should return the same instance');

  t.end();
});

test('[No changes] addTagRefinement', function(t) {
  var state = SearchParameters.make({}).addTagRefinement('tag');

  t.equal(state.addTagRefinement('tag'), state, 'addTagRefinement should return the same instance');

  t.end();
});

test('[No changes] clearTags', function(t) {
  var state = SearchParameters.make({
    query: 'query'
  });

  t.equal(state.clearTags(), state, 'clearTags should return the same instance');

  t.end();
});

test('[No changes] addDisjunctiveFacetRefinement', function(t) {
  var state = SearchParameters.make({
    disjunctiveFacets: ['facet']
  }).addDisjunctiveFacetRefinement('facet', 'value');

  t.equal(state.addDisjunctiveFacetRefinement('facet', 'value'), state, 'addDisjunctiveFacetRefinement should return the same instance');

  t.end();
});

test('[No changes] removeDisjunctiveFacetRefinement', function(t) {
  var state = SearchParameters.make({
    disjunctiveFacets: ['facet']
  });

  t.equal(state.removeDisjunctiveFacetRefinement('facet', 'value'), state, 'removeDisjunctiveFacetRefinement should return the same instance');

  t.end();
});

test('[No changes] addFacetRefinement', function(t) {
  var state = SearchParameters.make({
    facets: ['facet']
  }).addFacetRefinement('facet', 'value');

  t.equal(state.addFacetRefinement('facet', 'value'), state, 'addFacetRefinement should return the same instance');

  t.end();
});

test('[No changes] removeDisjunctiveFacetRefinement', function(t) {
  var state = SearchParameters.make({
    disjunctiveFacets: ['facet']
  });

  t.equal(state.removeDisjunctiveFacetRefinement('facet', 'value'), state, 'removeDisjunctiveFacetRefinement should return the same instance');

  t.end();
});

test('[No changes] addNumericRefinement', function(t) {
  var state = SearchParameters.make({}).addNumericRefinement('attribute', '>', 0);

  t.equal(state.addNumericRefinement('attribute', '>', 0), state, 'addNumericRefinement should return the same instance');

  t.end();
});

test('[No changes] removeNumericRefinement', function(t) {
  var state = SearchParameters.make({});

  t.equal(state.removeNumericRefinement('attribute', '>'), state, 'removeNumericRefinement should return the same instance');

  t.end();
});

test('[No changes] setQueryParameter', function(t) {
  var state = SearchParameters.make({
    minWordSizefor1Typo: 50
  });

  t.equal(state.setQueryParameter('minWordSizefor1Typo', 50), state, 'setQueryParameter should return the same instance');

  t.end();
});
