'use strict';

var test = require('tape');
var algoliaSearchHelper = require('../../../index.js');

var fakeClient = {
  addAlgoliaAgent: function() {}
};

test('getQueryParameter', function(t) {
  var helper = algoliaSearchHelper(fakeClient, null);

  helper.addNumericRefinement('attribute', '=', 0);
  helper.addNumericRefinement('attribute', '=', 34);

  t.deepEqual(helper.getNumericRefinement('attribute', '='), [0, 34]);

  t.end();
});
