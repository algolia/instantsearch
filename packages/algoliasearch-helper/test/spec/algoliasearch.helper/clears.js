'use strict';

var algoliasearchHelper = require('../../../index');

function fixture() {
  var helper = algoliasearchHelper({}, 'Index', {
    facets: ['facet1', 'facet2', 'both_facet', 'excluded1', 'excluded2'],
    disjunctiveFacets: ['disjunctiveFacet1', 'disjunctiveFacet2', 'both_facet'],
    hierarchicalFacets: [
      {
        name: 'hierarchy1',
        attributes: ['a', 'b', 'c'],
      },
      {
        name: 'hierarchy2',
        attributes: ['d', 'e', 'f'],
      },
    ],
  });

  return helper
    .toggleRefine('facet1', '0')
    .toggleRefine('facet2', '0')
    .toggleRefine('disjunctiveFacet1', '0')
    .toggleRefine('disjunctiveFacet2', '0')
    .toggleFacetExclusion('excluded1', '0')
    .toggleFacetExclusion('excluded2', '0')
    .addHierarchicalFacetRefinement('hierarchy1', '0')
    .addHierarchicalFacetRefinement('hierarchy2', '0')
    .addNumericRefinement('numeric1', '>=', '0')
    .addNumericRefinement('numeric1', '<', '10')
    .addNumericRefinement('numeric2', '>=', 0)
    .addNumericRefinement('numeric2', '<', 10);
}

test('Check that the state objects match how we test them', function () {
  var helper = fixture();

  expect(helper.state.facetsRefinements).toEqual({
    facet1: ['0'],
    facet2: ['0'],
  });
  expect(helper.state.disjunctiveFacetsRefinements).toEqual({
    disjunctiveFacet1: ['0'],
    disjunctiveFacet2: ['0'],
  });
  expect(helper.state.facetsExcludes).toEqual({
    excluded1: ['0'],
    excluded2: ['0'],
  });
  expect(helper.state.numericRefinements).toEqual({
    numeric1: { '>=': [0], '<': [10] },
    numeric2: { '>=': [0], '<': [10] },
  });
});

test('Clear with a name should work on every type and not remove others than targetted name', function () {
  var helper = fixture();

  helper.clearRefinements('facet1');
  expect(helper.state.facetsRefinements).toEqual({ facet2: ['0'] });

  helper.clearRefinements('disjunctiveFacet1');
  expect(helper.state.disjunctiveFacetsRefinements).toEqual({
    disjunctiveFacet2: ['0'],
  });

  helper.clearRefinements('excluded1');
  expect(helper.state.facetsExcludes).toEqual({ excluded2: ['0'] });

  helper.clearRefinements('numeric1');
  expect(helper.state.numericRefinements).toEqual({
    numeric2: { '>=': [0], '<': [10] },
  });
});

test('Clearing the same field from multiple elements should remove it everywhere', function () {
  var helper = fixture();

  helper
    .addNumericRefinement('facet1', '>=', '10')
    .toggleFacetExclusion('facet1', 'value');

  expect(helper.state.facetsRefinements.facet1).toEqual(['0']);
  expect(helper.state.numericRefinements.facet1).toEqual({ '>=': [10] });
  expect(helper.state.facetsExcludes.facet1).toEqual(['value']);

  helper.clearRefinements('facet1');
  expect(helper.state.facetsRefinements.facet1).toBeUndefined();
  expect(helper.state.numericRefinements.facet1).toBeUndefined();
  expect(helper.state.facetsExcludes.facet1).toBeUndefined();
});

test('Clear with a function: neutral predicate', function () {
  var helper = fixture();
  var state0 = helper.state;

  helper.clearRefinements(function () {
    return false;
  });

  expect(helper.state.numericRefinements).toEqual(state0.numericRefinements);
  expect(helper.state.facetsRefinements).toEqual(state0.facetsRefinements);
  expect(helper.state.facetsExcludes).toEqual(state0.facetsExcludes);
  expect(helper.state.disjunctiveFacetsRefinements).toEqual(
    state0.disjunctiveFacetsRefinements
  );
});

test('Clear with a function: remove all predicate', function () {
  var helper = fixture();

  helper.clearRefinements(function () {
    return true;
  });

  Object.keys(helper.state.numericRefinements).forEach(function (facet) {
    Object.keys(helper.state.numericRefinements[facet]).forEach(function (
      operator
    ) {
      expect(helper.state.numericRefinements[facet][operator]).toHaveLength(0);
    });
  });
  Object.keys(helper.state.facetsRefinements).forEach(function (facet) {
    expect(helper.state.facetsRefinements[facet]).toHaveLength(0);
  });
  Object.keys(helper.state.facetsExcludes).forEach(function (facet) {
    expect(helper.state.facetsExcludes[facet]).toHaveLength(0);
  });
  Object.keys(helper.state.disjunctiveFacetsRefinements).forEach(function (
    facet
  ) {
    expect(helper.state.disjunctiveFacetsRefinements[facet]).toHaveLength(0);
  });
});

test('Clear with a function: filtering', function () {
  var helper = fixture();

  var checkType = {
    numeric: false,
    disjunctiveFacet: false,
    conjunctiveFacet: false,
    exclude: false,
    hierarchicalFacet: false,
  };

  helper.clearRefinements(function (value, key, type) {
    checkType[type] = true;

    return key.indexOf('1') !== -1;
  });

  expect(Object.keys(checkType).length).toBe(5);
  Object.keys(checkType).forEach(function (typeTest) {
    expect(typeTest).toBeTruthy();
  });

  expect(helper.state.facetsRefinements).toEqual({ facet1: [], facet2: ['0'] });
  expect(helper.state.disjunctiveFacetsRefinements).toEqual({
    disjunctiveFacet1: [],
    disjunctiveFacet2: ['0'],
  });
  expect(helper.state.facetsExcludes).toEqual({
    excluded1: [],
    excluded2: ['0'],
  });
  expect(helper.state.numericRefinements).toEqual({
    numeric1: { '>=': [], '<': [] },
    numeric2: { '>=': [0], '<': [10] },
  });
  expect(helper.state.hierarchicalFacetsRefinements).toEqual({
    hierarchy1: [],
    hierarchy2: ['0'],
  });
});

test('Clearing twice the same attribute should be not problem', function () {
  var helper = fixture();

  expect(helper.state.facetsRefinements.facet1).toEqual(['0']);
  helper.clearRefinements('facet1');
  expect(helper.state.facetsRefinements.facet1).toBeUndefined();
  expect(function () {
    helper.clearRefinements('facet1');
  }).not.toThrow();

  expect(helper.state.disjunctiveFacetsRefinements.disjunctiveFacet1).toEqual([
    '0',
  ]);
  helper.clearRefinements('disjunctiveFacet1');
  expect(
    helper.state.disjunctiveFacetsRefinements.disjunctiveFacet1
  ).toBeUndefined();
  expect(function () {
    helper.clearRefinements('disjunctiveFacet1');
  }).not.toThrow();

  expect(helper.state.facetsExcludes.excluded1).toEqual(['0']);
  helper.clearRefinements('excluded1');
  expect(helper.state.facetsExcludes.excluded1).toBeUndefined();
  expect(function () {
    helper.clearRefinements('excluded1');
  }).not.toThrow();

  expect(helper.state.numericRefinements.numeric1).toEqual({
    '>=': [0],
    '<': [10],
  });
  helper.clearRefinements('numeric1');
  expect(helper.state.numericRefinements.numeric1).toBeUndefined();
  expect(function () {
    helper.clearRefinements('numeric1');
  }).not.toThrow();
});

test('Clearing without parameters should clear everything', function () {
  var helper = fixture();

  helper.clearRefinements();

  expect(helper.state.numericRefinements).toEqual({});
  expect(helper.state.facetsRefinements).toEqual({});
  expect(helper.state.disjunctiveFacetsRefinements).toEqual({});
  expect(helper.state.hierarchicalFacetsRefinements).toEqual({});
});

test('Clearing with no effect should not update the state', function () {
  var helper = fixture();
  // Reset the state
  helper.clearRefinements();
  var emptyState = helper.state;
  // This operation should not update the reference to the state
  helper.clearRefinements();

  expect(helper.state.numericRefinements).toBe(emptyState.numericRefinements);
  expect(helper.state.facetsRefinements).toBe(emptyState.facetsRefinements);
  expect(helper.state.disjunctiveFacetsRefinements).toBe(
    emptyState.disjunctiveFacetsRefinements
  );
  expect(helper.state.hierarchicalFacetsRefinements).toBe(
    emptyState.hierarchicalFacetsRefinements
  );

  expect(helper.state).toBe(emptyState);
});

test('Clearing with no effect should not update the state, if used with an unknown attribute', function () {
  var helper = fixture();
  var initialState = helper.state;
  // This operation should not update the reference to the state
  helper.clearRefinements('unknown');

  expect(helper.state.numericRefinements).toEqual(
    initialState.numericRefinements
  );
  expect(helper.state.facetsRefinements).toEqual(
    initialState.facetsRefinements
  );
  expect(helper.state.disjunctiveFacetsRefinements).toEqual(
    initialState.disjunctiveFacetsRefinements
  );
  expect(helper.state.hierarchicalFacetsRefinements).toEqual(
    initialState.hierarchicalFacetsRefinements
  );

  expect(helper.state).toEqual(initialState);
});
