'use strict';

var algoliasearchHelper = require('../../index');

var emptyClient = {};

test('Adding refinements should add an entry to the refinements attribute', function () {
  var facetName = 'facet1';
  var facetValue = '42';

  var helper = algoliasearchHelper(emptyClient, 'index', {
    facets: [facetName],
  });

  expect(Object.keys(helper.state.facetsRefinements).length).toBe(0);
  helper.addFacetRefinement(facetName, facetValue);
  expect(Object.keys(helper.state.facetsRefinements).length).toBe(1);
  expect(helper.state.facetsRefinements.facet1).toEqual([facetValue]);
  helper.addFacetRefinement(facetName, facetValue);
  expect(Object.keys(helper.state.facetsRefinements).length).toBe(1);
  helper.removeFacetRefinement(facetName, facetValue);
  expect(Object.keys(helper.state.facetsRefinements).length).toBe(1);
  expect(helper.state.facetsRefinements[facetName]).toEqual([]);
});

test('Adding several refinements for a single attribute should be handled', function () {
  var facetName = 'facet';

  var helper = algoliasearchHelper(emptyClient, null, {
    facets: [facetName],
  });

  expect(Object.keys(helper.state.facetsRefinements).length).toBe(0);
  helper.addFacetRefinement(facetName, 'value1');
  expect(Object.keys(helper.state.facetsRefinements[facetName]).length).toBe(1);
  helper.addFacetRefinement(facetName, 'value2');
  expect(Object.keys(helper.state.facetsRefinements[facetName]).length).toBe(2);
  helper.addFacetRefinement(facetName, 'value1');
  expect(Object.keys(helper.state.facetsRefinements[facetName]).length).toBe(2);
});

test('Toggling several refinements for a single attribute should be handled', function () {
  var facetName = 'facet';

  var helper = algoliasearchHelper(emptyClient, null, {
    facets: [facetName],
  });

  expect(Object.keys(helper.state.facetsRefinements).length).toBe(0);
  helper.toggleFacetRefinement(facetName, 'value1');
  expect(Object.keys(helper.state.facetsRefinements[facetName]).length).toBe(1);
  helper.toggleFacetRefinement(facetName, 'value2');
  expect(Object.keys(helper.state.facetsRefinements[facetName]).length).toBe(2);
  helper.toggleFacetRefinement(facetName, 'value1');
  expect(Object.keys(helper.state.facetsRefinements[facetName]).length).toBe(1);
  expect(helper.state.facetsRefinements[facetName]).toEqual(['value2']);
});

test('Using toggleFacetRefinement on a non specified facet should throw an exception', function () {
  var helper = algoliasearchHelper(emptyClient, null, {});

  expect(function () {
    helper.toggleFacetRefinement('unknown', 'value');
  }).toThrow();
});

test('Removing several refinements for a single attribute should be handled', function () {
  var facetName = 'facet';

  var helper = algoliasearchHelper(emptyClient, null, {
    facets: [facetName],
  });

  expect(Object.keys(helper.state.facetsRefinements).length).toBe(0);
  helper.addFacetRefinement(facetName, 'value1');
  helper.addFacetRefinement(facetName, 'value2');
  helper.addFacetRefinement(facetName, 'value3');
  expect(Object.keys(helper.state.facetsRefinements[facetName]).length).toBe(3);
  helper.removeFacetRefinement(facetName, 'value2');
  expect(Object.keys(helper.state.facetsRefinements[facetName]).length).toBe(2);
  expect(helper.state.facetsRefinements[facetName]).toEqual([
    'value1',
    'value3',
  ]);
});

test('[Conjunctive] Facets should be resilient to user attempt to use numbers', function () {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2'],
  });

  helper.addFacetRefinement('facet1', 42);
  expect(helper.state.isFacetRefined('facet1', 42)).toBe(true);
  expect(helper.state.isFacetRefined('facet1', '42')).toBe(true);

  var stateWithFacet1and42 = helper.state;

  helper.removeFacetRefinement('facet1', '42');
  expect(helper.state.isFacetRefined('facet1', '42')).toBe(false);

  helper.setState(stateWithFacet1and42);
  helper.removeFacetRefinement('facet1', 42);
  expect(helper.state.isFacetRefined('facet1', 42)).toBe(false);
});

test('[Exclude] Facets should be resilient to user attempt to use numbers', function () {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2'],
  });

  helper.addFacetExclusion('facet1', 42);
  expect(helper.state.isExcludeRefined('facet1', 42)).toBe(true);
  expect(helper.state.isExcludeRefined('facet1', '42')).toBe(true);

  var stateWithFacet1Without42 = helper.state;

  helper.removeFacetExclusion('facet1', '42');
  expect(helper.state.isExcludeRefined('facet1', '42')).toBe(false);

  helper.setState(stateWithFacet1Without42);
  helper.removeFacetExclusion('facet1', 42);
  expect(helper.state.isExcludeRefined('facet1', 42)).toBe(false);
});

test('[Disjunctive] Facets should be resilient to user attempt to use numbers', function () {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2'],
  });

  helper.addDisjunctiveFacetRefinement('facet2', 42);
  expect(helper.state.isDisjunctiveFacetRefined('facet2', 42)).toBe(true);
  expect(helper.state.isDisjunctiveFacetRefined('facet2', '42')).toBe(true);

  var stateWithFacet2and42 = helper.state;

  helper.removeDisjunctiveFacetRefinement('facet2', '42');
  expect(helper.state.isDisjunctiveFacetRefined('facet2', '42')).toBe(false);
  helper.setState(stateWithFacet2and42);

  helper.removeDisjunctiveFacetRefinement('facet2', 42);
  expect(helper.state.isDisjunctiveFacetRefined('facet2', 42)).toBe(false);
});
