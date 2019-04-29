'use strict';

var forOwn = require('lodash/forOwn');
var SearchParameters = require('../../../src/SearchParameters');

test('Constructor should accept an object with known keys', function() {
  var legitConfig = {
    'query': '',
    'disjunctiveFacets': [
      'customerReviewCount',
      'category',
      'salePrice_range',
      'manufacturer'
    ],
    'maxValuesPerFacet': 30,
    'page': 0,
    'hitsPerPage': 10,
    'facets': [
      'type',
      'shipping'
    ]
  };
  var params = new SearchParameters(legitConfig);
  forOwn(legitConfig, function(v, k) {
    expect(params[k]).toEqual(v);
  });
});

test('Constructor should accept an object with unknown keys', function() {
  var betaConfig = {
    'query': '',
    'disjunctiveFacets': [
      'customerReviewCount',
      'category',
      'salePrice_range',
      'manufacturer'
    ],
    'maxValuesPerFacet': 30,
    'page': 0,
    'hitsPerPage': 10,
    'facets': [
      'type',
      'shipping'
    ],
    'betaParameter': true,
    'otherBetaParameter': ['alpha', 'omega']
  };
  var params = new SearchParameters(betaConfig);
  forOwn(betaConfig, function(v, k) {
    expect(params[k]).toEqual(v);
  });
});

test('Factory should accept an object with known keys', function() {
  var legitConfig = {
    'query': '',
    'disjunctiveFacets': [
      'customerReviewCount',
      'category',
      'salePrice_range',
      'manufacturer'
    ],
    'maxValuesPerFacet': 30,
    'page': 0,
    'hitsPerPage': 10,
    'facets': [
      'type',
      'shipping'
    ]
  };
  var params = SearchParameters.make(legitConfig);
  forOwn(legitConfig, function(v, k) {
    expect(params[k]).toEqual(v);
  });
});

test('Constructor should accept an object with unknown keys', function() {
  var betaConfig = {
    'query': '',
    'disjunctiveFacets': [
      'customerReviewCount',
      'category',
      'salePrice_range',
      'manufacturer'
    ],
    'maxValuesPerFacet': 30,
    'page': 0,
    'hitsPerPage': 10,
    'facets': [
      'type',
      'shipping'
    ],
    'betaParameter': true,
    'otherBetaParameter': ['alpha', 'omega']
  };
  var params = SearchParameters.make(betaConfig);
  forOwn(betaConfig, function(v, k) {
    expect(params[k]).toEqual(v);
  });
});
