'use strict';

var test = require('tape');

var RefinementList = require('../../../../src/SearchParameters/RefinementList.js');
var clear = RefinementList.clearRefinement;

test('When removing all refinements of a state without any', function(t) {
  var initialRefinementList = {};
  t.equal(clear(initialRefinementList), initialRefinementList, 'it should return the same ref');
  t.end();
});

test('When removing refinements of a specific attribute, and there are no refinements for this attribute', function(t) {
  var initialRefinementList = {
    'attribute': ['test']
  };

  t.equal(clear(initialRefinementList, 'notThisAttribute'), initialRefinementList, 'it should return the same ref');
  t.end();
});

test('When removing numericRefinements using a function, and there are no changes', function(t) {
  var initialRefinementList = {
    'attribute': ['test']
  };

  function clearNothing() {return false;}
  function clearUndefinedAttribute(value, attribute) {return attribute === 'category';}
  function clearUndefinedValue(value) {return value === 'toast';}

  t.equal(clear(initialRefinementList, clearNothing, 'facet'), initialRefinementList, 'it should return the same ref - nothing');
  t.equal(
    clear(initialRefinementList, clearUndefinedAttribute, 'facet'),
    initialRefinementList,
    'it should return the same ref - undefined attribute');
  t.equal(clear(initialRefinementList, clearUndefinedValue, 'facet'), initialRefinementList, 'it should return the same ref - undefined value');

  t.end();
});

