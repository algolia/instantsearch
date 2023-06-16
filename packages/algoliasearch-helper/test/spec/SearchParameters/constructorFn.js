'use strict';

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
  Object.entries(legitConfig).forEach(function([k, v]) {
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
  Object.entries(betaConfig).forEach(function([k, v]) {
    expect(params[k]).toEqual(v);
  });
});

test('Constructor should ignore keys with undefined values', function() {
  var state = new SearchParameters({
    query: '',
    page: undefined
  });

  expect(state).not.toHaveProperty('page');
});

test('Constructor should warn about invalid userToken', function () {
  const message =
    '[algoliasearch-helper] The `userToken` parameter is invalid. This can lead to wrong analytics.\n  - Format: [a-zA-Z0-9_-]{1,64}';
  console.warn = jest.fn();

  var sp1 = new SearchParameters({
    userToken: ''
  });
  expect(console.warn).toHaveBeenCalledTimes(1);
  expect(console.warn).toHaveBeenLastCalledWith(message);
  expect(sp1.userToken).toBe('');

  var sp2 = new SearchParameters({
    userToken: null
  });
  expect(console.warn).toHaveBeenCalledTimes(2);
  expect(console.warn).toHaveBeenLastCalledWith(message);
  expect(sp2.userToken).toBe(null);

  var sp3 = new SearchParameters({
    userToken: 'wrong user token!'
  });
  expect(console.warn).toHaveBeenCalledTimes(3);
  expect(console.warn).toHaveBeenLastCalledWith(message);
  expect(sp3.userToken).toBe('wrong user token!');
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
  Object.entries(legitConfig).forEach(function([k, v]) {
    expect(params[k]).toEqual(v);
  });
});

test('Factory should accept an object with unknown keys', function() {
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
  Object.entries(betaConfig).forEach(function([k, v]) {
    expect(params[k]).toEqual(v);
  });
});

test('Factory should ignore keys with undefined values', function() {
  var state = SearchParameters.make({
    query: '',
    page: undefined
  });

  expect(state).not.toHaveProperty('page');
});

test('Factory should warn about invalid userToken', function() {
  const message = '[algoliasearch-helper] The `userToken` parameter is invalid. This can lead to wrong analytics.\n  - Format: [a-zA-Z0-9_-]{1,64}';
  console.warn = jest.fn();

  SearchParameters.make({userToken: null});
  expect(console.warn).toHaveBeenCalledTimes(1);
  expect(console.warn).toHaveBeenLastCalledWith(message);

  SearchParameters.make({userToken: ''});
  expect(console.warn).toHaveBeenCalledTimes(2);
  expect(console.warn).toHaveBeenLastCalledWith(message);

  SearchParameters.make({userToken: 'my invalid token!'});
  expect(console.warn).toHaveBeenCalledTimes(3);
  expect(console.warn).toHaveBeenLastCalledWith(message);
});
