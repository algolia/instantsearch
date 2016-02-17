'use strict';

var test = require('tape');
var SearchParameters = require('../../../src/SearchParameters');

test('isNumericRefined with 3 parameters', function(t) {
  var params = new SearchParameters();

  t.notOk(params.isNumericRefined('age', '>', '3'));
  t.notOk(params.isNumericRefined('age', '>', '7'));
  t.notOk(params.isNumericRefined('age', '<', '7'));
  t.notOk(params.isNumericRefined('size', '>', '3'));

  var paramsWithNumerics = (params.addNumericRefinement('age', '>', '3'));

  t.ok(paramsWithNumerics.isNumericRefined('age', '>', '3'));
  t.ok(paramsWithNumerics.isNumericRefined('age', '>', 3));
  t.notOk(paramsWithNumerics.isNumericRefined('age', '>', '7'));
  t.notOk(paramsWithNumerics.isNumericRefined('age', '<', '7'));
  t.notOk(paramsWithNumerics.isNumericRefined('size', '>', '3'));

  var paramsWithArray = params.addNumericRefinement('age', '=', [3, '4']);
  t.ok(paramsWithArray.isNumericRefined('age', '=', [3, 4]));
  t.ok(paramsWithArray.isNumericRefined('age', '=', ['3', 4]));
  t.ok(paramsWithArray.isNumericRefined('age', '=', [3, '4']));
  t.ok(paramsWithArray.isNumericRefined('age', '=', ['3', '4']));
  t.notOk(paramsWithArray.isNumericRefined('age', '=', 3));
  t.notOk(paramsWithArray.isNumericRefined('age', '=', '3'));

  t.end();
});

test('isNumericRefined with 2 parameters', function(t) {
  var params = new SearchParameters();

  t.notOk(params.isNumericRefined('age', '>'));
  t.notOk(params.isNumericRefined('size', '>'));

  var paramsWithNumerics = (params.addNumericRefinement('age', '>', '3'));

  t.ok(paramsWithNumerics.isNumericRefined('age', '>'));
  t.notOk(paramsWithNumerics.isNumericRefined('size', '>'));

  t.end();
});

test('isNumericRefined with 1 parameter', function(t) {
  var params = new SearchParameters();

  t.notOk(params.isNumericRefined('age'));
  t.notOk(params.isNumericRefined('size'));

  var paramsWithNumerics = (params.addNumericRefinement('age', '>', '3'));

  t.ok(paramsWithNumerics.isNumericRefined('age'));
  t.notOk(paramsWithNumerics.isNumericRefined('size'));

  t.end();
});
