'use strict';

var test = require('tape');
var SearchParameters = require('../../../src/SearchParameters');

test('When removing all numeric refinements of a state without any', function(t) {
  var state = SearchParameters.make({});
  t.equal(state._clearNumericRefinements(), state.numericRefinements, 'it should return the same ref');
  t.end();
});

test('When removing numericRefinements of a specific attribute, and there are no refinements for this attribute', function(t) {
  var state = SearchParameters.make({
    numericRefinements: {
      price: {'>': [300]}
    }
  });

  t.equal(state._clearNumericRefinements('size'), state.numericRefinements, 'it should return the same ref');
  t.end();
});

test('When removing numericRefinements using a function, and there are no changes', function(t) {
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

  t.equal(state._clearNumericRefinements(clearNothing), state.numericRefinements, 'it should return the same ref - nothing');
  t.equal(state._clearNumericRefinements(clearUndefinedAttribute), state.numericRefinements, 'it should return the same ref - undefined attribute');
  t.equal(state._clearNumericRefinements(clearUndefinedOperator), state.numericRefinements, 'it should return the same ref - undefined operator');
  t.equal(state._clearNumericRefinements(clearUndefinedValue), state.numericRefinements, 'it should return the same ref - undefined value');

  t.end();
});
