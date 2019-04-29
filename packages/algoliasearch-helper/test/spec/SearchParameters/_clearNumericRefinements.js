'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('When removing all numeric refinements of a state without any', function() {
  var state = SearchParameters.make({});
  expect(state._clearNumericRefinements()).toBe(state.numericRefinements);
});

test('When removing numericRefinements of a specific attribute, and there are no refinements for this attribute', function() {
  var state = SearchParameters.make({
    numericRefinements: {
      price: {'>': [300]}
    }
  });

  expect(state._clearNumericRefinements('size')).toBe(state.numericRefinements);
});

test('When removing numericRefinements using a function, and there are no changes', function() {
  var state = SearchParameters.make({
    numericRefinements: {
      price: {'>': [300, 30]},
      size: {'=': [32, 30]}
    }
  });

  function clearNothing() {return false;}
  function clearUndefinedAttribute(v, attribute) {return attribute === 'distance';}
  function clearUndefinedOperator(v) {return v.op === '<';}
  function clearUndefinedValue(v) {return v.val === 3;}

  expect(state._clearNumericRefinements(clearNothing)).toBe(state.numericRefinements);
  expect(state._clearNumericRefinements(clearUndefinedAttribute)).toBe(state.numericRefinements);
  expect(state._clearNumericRefinements(clearUndefinedOperator)).toBe(state.numericRefinements);
  expect(state._clearNumericRefinements(clearUndefinedValue)).toBe(state.numericRefinements);
});
