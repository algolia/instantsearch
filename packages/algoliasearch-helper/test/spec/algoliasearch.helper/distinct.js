'use strict';

var algoliasearchHelper = require('../../../');
var requestBuilder = require('../../../src/requestBuilder');

var fakeClient = {};

test('Distinct not set', function () {
  var helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facetConj'],
    disjunctiveFacets: ['facet'],
  });
  var state0 = helper.state;

  var disjunctiveFacetSearchParam =
    requestBuilder._getDisjunctiveFacetSearchParams(helper.state);
  expect(disjunctiveFacetSearchParam.distinct).toBe(undefined);
  var facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(undefined);

  helper.setState(state0);
  helper.setQuery('not empty');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  expect(disjunctiveFacetSearchParam.distinct).toBe(undefined);
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(undefined);
  requestBuilder._getQueries('', helper.state).forEach(function (q) {
    expect(q.hasOwnProperty('distinct')).toBeFalsy();
  });

  helper.setState(state0);
  helper.addDisjunctiveRefine('facet', 'value');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  expect(disjunctiveFacetSearchParam.distinct).toBe(undefined);
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(undefined);
  requestBuilder._getQueries('', helper.state).forEach(function (q) {
    expect(q.hasOwnProperty('distinct')).toBeFalsy();
  });

  helper.setState(state0);
  helper.addRefine('facetConj', 'value');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  expect(disjunctiveFacetSearchParam.distinct).toBe(undefined);
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(undefined);
  requestBuilder._getQueries('', helper.state).forEach(function (q) {
    expect(q.hasOwnProperty('distinct')).toBeFalsy();
  });

  helper.setState(state0);
  helper.addNumericRefinement('attribute', '>', '0');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  expect(disjunctiveFacetSearchParam.distinct).toBe(undefined);
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(undefined);
  requestBuilder._getQueries('', helper.state).forEach(function (q) {
    expect(q.hasOwnProperty('distinct')).toBeFalsy();
  });
});

test('Distinct set to true', function () {
  var helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facetConj'],
    disjunctiveFacets: ['facet'],
  }).setQueryParameter('distinct', true);
  var state0 = helper.state;

  var disjunctiveFacetSearchParam =
    requestBuilder._getDisjunctiveFacetSearchParams(helper.state);

  expect(disjunctiveFacetSearchParam.distinct).toBe(true);

  var facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);

  expect(facetSearchParam.distinct).toBe(true);

  helper.setState(state0);
  helper.setQuery('not empty');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  expect(disjunctiveFacetSearchParam.distinct).toBe(true);
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(true);

  helper.setState(state0);
  helper.addDisjunctiveRefine('facet', 'value');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  expect(disjunctiveFacetSearchParam.distinct).toBe(true);
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(true);

  helper.setState(state0);
  helper.addRefine('facetConj', 'value');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  expect(disjunctiveFacetSearchParam.distinct).toBe(true);
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(true);

  helper.setState(state0);
  helper.addNumericRefinement('attribute', '>', '0');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  expect(disjunctiveFacetSearchParam.distinct).toBe(true);
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(true);
});

test('Distinct to false', function () {
  var helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facetConj'],
    disjunctiveFacets: ['facet'],
  }).setQueryParameter('distinct', false);
  var state0 = helper.state;

  var disjunctiveFacetSearchParam =
    requestBuilder._getDisjunctiveFacetSearchParams(helper.state);

  expect(disjunctiveFacetSearchParam.distinct).toBe(false);

  var facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);

  expect(facetSearchParam.distinct).toBe(false);

  helper.setState(state0);
  helper.setQuery('not empty');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  expect(disjunctiveFacetSearchParam.distinct).toBe(false);
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(false);

  helper.setState(state0);
  helper.addDisjunctiveRefine('facet', 'value');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  expect(disjunctiveFacetSearchParam.distinct).toBe(false);
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(false);

  helper.setState(state0);
  helper.addRefine('facetConj', 'value');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  expect(disjunctiveFacetSearchParam.distinct).toBe(false);
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(false);

  helper.setState(state0);
  helper.addNumericRefinement('attribute', '>', '0');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  expect(disjunctiveFacetSearchParam.distinct).toBe(false);
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(false);
});

test('Distinct as a number', function () {
  var distinctValue = 2;
  var helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facetConj'],
    disjunctiveFacets: ['facet'],
  }).setQueryParameter('distinct', distinctValue);

  var state0 = helper.state;

  var disjunctiveFacetSearchParam =
    requestBuilder._getDisjunctiveFacetSearchParams(helper.state);
  expect(disjunctiveFacetSearchParam.distinct).toBe(distinctValue);

  var facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(distinctValue);

  helper.setState(state0);
  helper.setQuery('not empty');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  expect(disjunctiveFacetSearchParam.distinct).toBe(distinctValue);
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(distinctValue);

  helper.setState(state0);
  helper.addDisjunctiveRefine('facet', 'value');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  expect(disjunctiveFacetSearchParam.distinct).toBe(distinctValue);
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(distinctValue);

  helper.setState(state0);
  helper.addRefine('facetConj', 'value');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  expect(disjunctiveFacetSearchParam.distinct).toBe(distinctValue);
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(distinctValue);

  helper.setState(state0);
  helper.addNumericRefinement('attribute', '>', '0');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  expect(disjunctiveFacetSearchParam.distinct).toBe(distinctValue);
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  expect(facetSearchParam.distinct).toBe(distinctValue);
});
