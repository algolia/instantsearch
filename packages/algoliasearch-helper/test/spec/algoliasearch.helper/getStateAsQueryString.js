'use strict';

var test = require('tape');
var algoliaSearchHelper = require('../../../index.js');

var fakeClient = {};

test('getStateAsQueryString', function(t) {
  var helper = algoliaSearchHelper(fakeClient, 'fake index', {
    facets: ['color'],
    hierarchicalFacets: [{
      name: 'products',
      attributes: ['categories.lvl0', 'categories.lvl1']
    }]
  });
  helper.setQuery('hello mama');
  helper.toggleRefine('color', 'white');
  helper.toggleRefine('products', 'fruits > bananas');
  t.equal(
    helper.getStateAsQueryString(),
    'q=hello%20mama&fR[color][0]=white&hFR[products][0]=fruits%20%3E%20bananas'
  );

  t.end();
});

test('getStateAsQueryString({safe: true})', function(t) {
  var helper = algoliaSearchHelper(fakeClient, 'fake index', {
    facets: ['color'],
    hierarchicalFacets: [{
      name: 'products',
      attributes: ['categories.lvl0', 'categories.lvl1']
    }]
  });
  helper.setQuery('hello mama');
  helper.toggleRefine('color', 'white');
  helper.toggleRefine('products', 'fruits > bananas');
  t.equal(
    helper.getStateAsQueryString({safe: true}),
    'q=hello%20mama&fR%5Bcolor%5D%5B0%5D=white&hFR%5Bproducts%5D%5B0%5D=fruits%20%3E%20bananas'
  );

  t.end();
});
