'use strict';

var test = require('tape');
var forOwn = require('lodash/forOwn');
var SearchParameters = require('../../../src/SearchParameters');

test('Constructor should accept an object with known keys', function(t) {
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
    t.deepEqual(params[k], v);
  });

  t.end();
});

test('Constructor should accept an object with unknown keys', function(t) {
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
    t.deepEqual(params[k], v);
  });

  t.end();
});

test('Factory should accept an object with known keys', function(t) {
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
    t.deepEqual(params[k], v);
  });

  t.end();
});

test('Constructor should accept an object with unknown keys', function(t) {
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
    t.deepEqual(params[k], v);
  });

  t.end();
});
