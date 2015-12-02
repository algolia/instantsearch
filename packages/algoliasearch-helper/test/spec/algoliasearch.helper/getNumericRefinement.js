'use strict';

var test = require('tape');
var algoliaSearchHelper = require('../../../index.js');

test('getQueryParameter', function(t) {
  var helper = algoliaSearchHelper(null, null);

  helper.addNumericRefinement('attribute', '=', 0);
  helper.addNumericRefinement('attribute', '=', 34);

  t.deepEqual(helper.getNumericRefinement('attribute', '='), [0, 34]);

  t.end();
});
