'use strict';

var algoliaSearchHelper = require('../../../index.js');

var fakeClient = {};

test('getQueryParameter', function() {
  var bind = require('lodash/bind');

  var helper = algoliaSearchHelper(fakeClient, null, {
    facets: ['facet1'],
    minWordSizefor1Typo: 8,
    ignorePlurals: true
  });

  expect(helper.getQueryParameter('facets')).toEqual(['facet1']);
  expect(helper.getQueryParameter('minWordSizefor1Typo')).toBe(8);
  expect(helper.getQueryParameter('ignorePlurals')).toBe(true);

  expect(bind(helper.getQueryParameter, helper, 'unknown')).toThrow();
});
