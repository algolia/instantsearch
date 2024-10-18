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
  helper.toggleRefine(facetName, 'value1');
  expect(Object.keys(helper.state.facetsRefinements[facetName]).length).toBe(1);
  helper.toggleRefine(facetName, 'value2');
  expect(Object.keys(helper.state.facetsRefinements[facetName]).length).toBe(2);
  helper.toggleRefine(facetName, 'value1');
  expect(Object.keys(helper.state.facetsRefinements[facetName]).length).toBe(1);
  expect(helper.state.facetsRefinements[facetName]).toEqual(['value2']);
});

test('Using toggleRefine on a non specified facet should throw an exception', function () {
  var helper = algoliasearchHelper(emptyClient, null, {});

  expect(function () {
    helper.toggleRefine('unknown', 'value');
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

test('isDisjunctiveRefined', function () {
  var facet = 'MyFacet';

  var helper = algoliasearchHelper(emptyClient, null, {
    disjunctiveFacets: [facet],
  });

  var value = 'MyValue';

  expect(helper.isDisjunctiveRefined(facet, value)).toBe(false);

  helper.addDisjunctiveFacetRefinement(facet, value);
  expect(helper.isDisjunctiveRefined(facet, value)).toBe(true);

  helper.removeDisjunctiveFacetRefinement(facet, value);
  expect(helper.isDisjunctiveRefined(facet, value)).toBe(false);
});

test('hasRefinements(facet) should return true if the facet is refined.', function () {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
  });

  expect(helper.hasRefinements('facet1')).toBe(false);

  helper.addFacetRefinement('facet1', 'boom');

  expect(helper.hasRefinements('facet1')).toBe(true);

  // in complete honesty we should be able to detect numeric facets but we can't
  // t.throws(helper.hasRefinements.bind(helper, 'notAFacet'), 'not a facet');
  expect(helper.hasRefinements(null)).toBe(false);
});

test('getRefinements should return all the refinements for a given facet', function () {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2', 'sales'],
  });

  helper
    .addFacetRefinement('facet1', 'val1')
    .addFacetRefinement('facet1', 'val2')
    .addFacetExclusion('facet1', 'val-1')
    .toggleRefine('facet1', 'val3');

  helper
    .addDisjunctiveFacetRefinement('facet2', 'val4')
    .addDisjunctiveFacetRefinement('facet2', 'val5')
    .toggleRefine('facet2', 'val6');

  helper
    .addNumericRefinement('sales', '>', '3')
    .addNumericRefinement('sales', '<', '9');

  expect(helper.getRefinements('facet1')).toEqual([
    { value: 'val1', type: 'conjunctive' },
    { value: 'val2', type: 'conjunctive' },
    { value: 'val3', type: 'conjunctive' },
    { value: 'val-1', type: 'exclude' },
  ]);

  expect(helper.getRefinements('facet2')).toEqual([
    { value: 'val4', type: 'disjunctive' },
    { value: 'val5', type: 'disjunctive' },
    { value: 'val6', type: 'disjunctive' },
  ]);

  expect(helper.getRefinements('sales')).toEqual([
    { value: [3], operator: '>', type: 'numeric' },
    { value: [9], operator: '<', type: 'numeric' },
  ]);
});

test('getRefinements should return an empty array if the facet has no refinement', function () {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2'],
  });

  expect(helper.getRefinements('facet1')).toEqual([]);
  expect(helper.getRefinements('facet2')).toEqual([]);
});

test('[Conjunctive] Facets should be resilient to user attempt to use numbers', function () {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2'],
  });

  helper.addFacetRefinement('facet1', 42);
  expect(helper.hasRefinements('facet1', 42)).toBe(true);
  expect(helper.hasRefinements('facet1', '42')).toBe(true);

  var stateWithFacet1and42 = helper.state;

  helper.removeFacetRefinement('facet1', '42');
  expect(helper.hasRefinements('facet1', '42')).toBe(false);

  helper.setState(stateWithFacet1and42);
  helper.removeFacetRefinement('facet1', 42);
  expect(helper.hasRefinements('facet1', 42)).toBe(false);
});

test('[Exclude] Facets should be resilient to user attempt to use numbers', function () {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2'],
  });

  helper.addFacetExclusion('facet1', 42);
  expect(helper.isExcluded('facet1', 42)).toBe(true);
  expect(helper.isExcluded('facet1', '42')).toBe(true);

  var stateWithFacet1Without42 = helper.state;

  helper.removeExclude('facet1', '42');
  expect(helper.isExcluded('facet1', '42')).toBe(false);

  helper.setState(stateWithFacet1Without42);
  helper.removeExclude('facet1', 42);
  expect(helper.isExcluded('facet1', 42)).toBe(false);
});

test('[Disjunctive] Facets should be resilient to user attempt to use numbers', function () {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2'],
  });

  helper.addDisjunctiveFacetRefinement('facet2', 42);
  expect(helper.isDisjunctiveRefined('facet2', 42)).toBe(true);
  expect(helper.isDisjunctiveRefined('facet2', '42')).toBe(true);

  var stateWithFacet2and42 = helper.state;

  helper.removeDisjunctiveFacetRefinement('facet2', '42');
  expect(helper.isDisjunctiveRefined('facet2', '42')).toBe(false);
  helper.setState(stateWithFacet2and42);

  helper.removeDisjunctiveFacetRefinement('facet2', 42);
  expect(helper.isDisjunctiveRefined('facet2', 42)).toBe(false);
});
