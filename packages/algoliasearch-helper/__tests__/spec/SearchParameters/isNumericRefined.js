'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('isNumericRefined with 3 parameters', function () {
  var params = new SearchParameters();

  expect(params.isNumericRefined('age', '>', '3')).toBeFalsy();
  expect(params.isNumericRefined('age', '>', '7')).toBeFalsy();
  expect(params.isNumericRefined('age', '<', '7')).toBeFalsy();
  expect(params.isNumericRefined('size', '>', '3')).toBeFalsy();

  var paramsWithNumerics = params.addNumericRefinement('age', '>', '3');

  expect(paramsWithNumerics.isNumericRefined('age', '>', '3')).toBeTruthy();
  expect(paramsWithNumerics.isNumericRefined('age', '>', 3)).toBeTruthy();
  expect(paramsWithNumerics.isNumericRefined('age', '>', '7')).toBeFalsy();
  expect(paramsWithNumerics.isNumericRefined('age', '<', '7')).toBeFalsy();
  expect(paramsWithNumerics.isNumericRefined('size', '>', '3')).toBeFalsy();

  var paramsWithArray = params.addNumericRefinement('age', '=', [3, '4']);
  expect(paramsWithArray.isNumericRefined('age', '=', [3, 4])).toBeTruthy();
  expect(paramsWithArray.isNumericRefined('age', '=', ['3', 4])).toBeTruthy();
  expect(paramsWithArray.isNumericRefined('age', '=', [3, '4'])).toBeTruthy();
  expect(paramsWithArray.isNumericRefined('age', '=', ['3', '4'])).toBeTruthy();
  expect(paramsWithArray.isNumericRefined('age', '=', 3)).toBeFalsy();
  expect(paramsWithArray.isNumericRefined('age', '=', '3')).toBeFalsy();
});

test('isNumericRefined with 2 parameters', function () {
  var params = new SearchParameters();

  expect(params.isNumericRefined('age', '>')).toBeFalsy();
  expect(params.isNumericRefined('size', '>')).toBeFalsy();

  var paramsWithNumerics = params.addNumericRefinement('age', '>', '3');

  expect(paramsWithNumerics.isNumericRefined('age', '>')).toBeTruthy();
  expect(paramsWithNumerics.isNumericRefined('size', '>')).toBeFalsy();
});

test('isNumericRefined with 1 parameter', function () {
  var params = new SearchParameters();

  expect(params.isNumericRefined('age')).toBeFalsy();
  expect(params.isNumericRefined('size')).toBeFalsy();

  var paramsWithNumerics = params.addNumericRefinement('age', '>', '3');

  expect(paramsWithNumerics.isNumericRefined('age')).toBeTruthy();
  expect(paramsWithNumerics.isNumericRefined('size')).toBeFalsy();
});
