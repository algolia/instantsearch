'use strict';

var test = require('tape');
var algoliaSearchHelper = require('../../../index.js');

var fakeClient = {};

test('getNumericRefinement with single value addNumericRefinement', function(t) {
  var helper = algoliaSearchHelper(fakeClient, null);

  helper.addNumericRefinement('attribute', '=', 0);
  helper.addNumericRefinement('attribute', '=', 34);

  t.deepEqual(helper.getNumericRefinement('attribute', '='), [0, 34]);

  t.end();
});

test('getNumericRefinement with multiple values addNumericRefinement', function(t) {
  var helper = algoliaSearchHelper(fakeClient, null);

  helper.addNumericRefinement('attribute', '=', [0, 34]);

  t.deepEqual(helper.getNumericRefinement('attribute', '='), [[0, 34]]);

  t.end();
});
