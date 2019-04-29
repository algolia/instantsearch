'use strict';

var algoliaSearchHelper = require('../../../index.js');

var fakeClient = {};

test('getStateAsQueryString', function() {
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
  expect(helper.getStateAsQueryString()).toBe(
    'q=hello%20mama&fR[color][0]=white&hFR[products][0]=fruits%20%3E%20bananas'
  );
});

test('getStateAsQueryString({safe: true})', function() {
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
  expect(helper.getStateAsQueryString({safe: true})).toBe(
    'q=hello%20mama&fR%5Bcolor%5D%5B0%5D=white&hFR%5Bproducts%5D%5B0%5D=fruits%20%3E%20bananas'
  );
});
