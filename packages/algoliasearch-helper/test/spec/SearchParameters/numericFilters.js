'use strict';

var test = require('tape');
var SearchParameters = require('../../../src/SearchParameters');

var attribute = 'attribute';
var operator = '=';

/* Ensure that we add and then remove the same value, and get a state equivalent to the initial one */
function testSameValue(t, value) {
  var state0 = new SearchParameters();
  var state1 = state0.addNumericRefinement(attribute, operator, value);
  t.ok(state1.isNumericRefined(attribute, operator, value), 'Numeric value should be added');
  var state2 = state1.removeNumericRefinement(attribute, operator, value);
  t.notOk(state2.isNumericRefined(attribute, operator, value), 'Numeric value should not be refined anymore');
  t.deepEqual(state2, state0, 'The final state should be equivalent to the first one');
}

test('Should be able to add remove strings', function(t) {
  testSameValue(t, '40');
  t.end();
});

test('Should be able to add remove numbers', function(t) {
  testSameValue(t, 40);
  t.end();
});

test('Should be able to add remove arrays', function(t) {
  testSameValue(t, [40, '30']);
  t.end();
});
