'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('When removing all numeric refinements of a state without any', function () {
  var state = SearchParameters.make({});
  expect(state._clearNumericRefinements()).toBe(state.numericRefinements);
});

test('When removing numericRefinements of a specific attribute, which has no refinements', function () {
  var state = SearchParameters.make({
    numericRefinements: {
      size: {},
    },
  });

  expect(state._clearNumericRefinements('size')).toEqual({});
});

test('When removing numericRefinements of a specific attribute, and there are no refinements for this attribute', function () {
  var state = SearchParameters.make({
    numericRefinements: {
      price: { '>': [300] },
    },
  });

  expect(state._clearNumericRefinements('size')).toEqual(
    state.numericRefinements
  );
});

test('When removing refinements of a specific attribute, and another refinement is a substring of this attribute', function () {
  var state = SearchParameters.make({
    numericRefinements: {
      price: { '>': [300] },
      'price with taxes': { '>': [300] },
    },
  });

  const expectedNumericRefinements = {
    price: { '>': [300] },
  };

  expect(state._clearNumericRefinements('price with taxes')).toEqual(
    expectedNumericRefinements
  );
});

test('When removing numericRefinements using a function, and there are no changes', function () {
  var state = SearchParameters.make({
    numericRefinements: {
      price: { '>': [300, 30] },
      size: { '=': [32, 30] },
    },
  });

  function clearNothing() {
    return false;
  }
  function clearUndefinedAttribute(v, attribute) {
    return attribute === 'distance';
  }
  function clearUndefinedOperator(v) {
    return v.op === '<';
  }
  function clearUndefinedValue(v) {
    return v.val === 3;
  }

  expect(state._clearNumericRefinements(clearNothing)).toBe(
    state.numericRefinements
  );
  expect(state._clearNumericRefinements(clearUndefinedAttribute)).toBe(
    state.numericRefinements
  );
  expect(state._clearNumericRefinements(clearUndefinedOperator)).toBe(
    state.numericRefinements
  );
  expect(state._clearNumericRefinements(clearUndefinedValue)).toBe(
    state.numericRefinements
  );
});
