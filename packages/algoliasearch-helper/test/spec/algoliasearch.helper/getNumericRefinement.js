'use strict';

var algoliaSearchHelper = require('../../../');

var fakeClient = {};

test('getNumericRefinement with single value addNumericRefinement', function () {
  var helper = algoliaSearchHelper(fakeClient, null);

  helper.addNumericRefinement('attribute', '=', 0);
  helper.addNumericRefinement('attribute', '=', 34);

  expect(helper.getNumericRefinement('attribute', '=')).toEqual([0, 34]);
});

test('getNumericRefinement with multiple values addNumericRefinement', function () {
  var helper = algoliaSearchHelper(fakeClient, null);

  helper.addNumericRefinement('attribute', '=', [0, 34]);

  expect(helper.getNumericRefinement('attribute', '=')).toEqual([[0, 34]]);
});
