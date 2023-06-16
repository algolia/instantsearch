'use strict';

var RefinementList = require('../../../../src/SearchParameters/RefinementList');
var clear = RefinementList.clearRefinement;

test('When removing all refinements of a state without any', function() {
  var initialRefinementList = {};
  expect(clear(initialRefinementList)).toBe(initialRefinementList);
});

test('When removing refinements of a specific attribute, and there are no refinements for this attribute', function() {
  var initialRefinementList = {
    'attribute': ['test']
  };

  expect(clear(initialRefinementList, 'notThisAttribute')).toEqual(initialRefinementList);
});

test('When removing refinements of a specific attribute, and another refinement is a substring of this attribute', function() {
  var initialRefinementList = {
    'Brand': ['HP'],
    'CPU type': ['Core i5'],
    'Motherboard CPU type': ['Intel Core X']
  };
  var expectedRefinementList = {
    'Brand': ['HP'],
    'CPU type': ['Core i5']
  };

  expect(clear(initialRefinementList, 'Motherboard CPU type')).toEqual(expectedRefinementList);
});

test('When removing numericRefinements using a function, and there are no changes', function() {
  var initialRefinementList = {
    'attribute': ['test']
  };

  function clearNothing() {return false;}
  function clearUndefinedAttribute(value, attribute) {return attribute === 'category';}
  function clearUndefinedValue(value) {return value === 'toast';}

  expect(clear(initialRefinementList, clearNothing, 'facet')).toBe(initialRefinementList);
  expect(clear(initialRefinementList, clearUndefinedAttribute, 'facet')).toBe(initialRefinementList);
  expect(clear(initialRefinementList, clearUndefinedValue, 'facet')).toBe(initialRefinementList);
});

test('calling clear on a empty refinement removes it', function() {
  var initialRefinementList = {
    'attribute': []
  };

  expect(clear(initialRefinementList, 'attribute')).toEqual({});
});
