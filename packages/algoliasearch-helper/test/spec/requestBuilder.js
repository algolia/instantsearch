'use strict';

var requestBuilder = require('../../src/requestBuilder.js');
var SearchParameters = require('../../src/SearchParameters');
var getQueries = requestBuilder._getQueries;

test('The request builder should set analytics to subsequent queries', function() {
  var testData = require('../datasets/SearchParameters/search.dataset')();
  var searchParams = testData.searchParams;

  searchParams.analytics = true;

  var queries = getQueries(searchParams.index, searchParams);
  expect(queries.length).toBe(2);
  expect(queries[0].params.analytics).toBe(true);
  expect(queries[1].params.analytics).toBe(false);
});

test('The request builder should set clickAnalytics to subsequent queries', function() {
  var testData = require('../datasets/SearchParameters/search.dataset')();
  var searchParams = testData.searchParams;

  searchParams.clickAnalytics = true;

  var queries = getQueries(searchParams.index, searchParams);
  expect(queries.length).toBe(2);
  expect(queries[0].params.clickAnalytics).toBe(true);
  expect(queries[1].params.clickAnalytics).toBe(false);
});

test('The request builder should should force analytics to false on subsequent queries if not specified', function() {
  var testData = require('../datasets/SearchParameters/search.dataset')();
  var searchParams = testData.searchParams;

  var queries = getQueries(searchParams.index, searchParams);
  expect(queries.length).toBe(2);
  expect(queries[0].params.analytics).toBe(undefined);
  expect(queries[1].params.analytics).toBe(false);
});

test('The request builder should should force clickAnalytics to false on subsequent queries if not specified', function() {
  var testData = require('../datasets/SearchParameters/search.dataset')();
  var searchParams = testData.searchParams;

  var queries = getQueries(searchParams.index, searchParams);
  expect(queries.length).toBe(2);
  expect(queries[0].params.clickAnalytics).toBe(undefined);
  expect(queries[1].params.clickAnalytics).toBe(false);
});

test('does only a single query if refinements are empty', function() {
  var searchParams = new SearchParameters({
    disjunctiveFacets: ['test_disjunctive', 'test_numeric'],
    hierarchicalFacets: [{name: 'test_hierarchical', attributes: ['whatever']}],
    disjunctiveFacetsRefinements: {
      test_disjunctive: []
    },
    numericRefinements: {
      test_numeric: {}
    },
    hierarchicalFacetsRefinements: {
      test_hierarchical: []
    }
  });

  var queries = getQueries(searchParams.index, searchParams);
  expect(queries).toHaveLength(1);
});

describe('wildcard facets', function() {
  test('keeps as-is if no * present', function() {
    var searchParams = new SearchParameters({
      facets: ['test'],
      disjunctiveFacets: ['test_disjunctive', 'test_numeric'],
      hierarchicalFacets: [{name: 'test_hierarchical', attributes: ['whatever']}]
    });

    var queries = getQueries(searchParams.index, searchParams);

    expect(queries.length).toBe(1);
    expect(queries[0].params.facets).toEqual([
      'test',
      'test_disjunctive',
      'test_numeric',
      'whatever'
    ]);
  });

  test('keeps only *', function() {
    var searchParams = new SearchParameters({
      facets: ['test', '*'],
      disjunctiveFacets: ['test_disjunctive', 'test_numeric'],
      hierarchicalFacets: [{name: 'test_hierarchical', attributes: ['whatever']}]
    });

    var queries = getQueries(searchParams.index, searchParams);

    expect(queries.length).toBe(1);
    expect(queries[0].params.facets).toEqual(['*']);
  });

  test('keeps only * when first value', function() {
    var searchParams = new SearchParameters({
      facets: ['*', 'test'],
      disjunctiveFacets: ['test_disjunctive', 'test_numeric'],
      hierarchicalFacets: [{name: 'test_hierarchical', attributes: ['whatever']}]
    });

    var queries = getQueries(searchParams.index, searchParams);

    expect(queries.length).toBe(1);
    expect(queries[0].params.facets).toEqual(['*']);
  });

  test('only applies to first query', function() {
    var searchParams = new SearchParameters({
      facets: ['test', '*'],
      disjunctiveFacets: ['test_disjunctive', 'test_numeric'],
      hierarchicalFacets: [{name: 'test_hierarchical', attributes: ['whatever']}],
      disjunctiveFacetsRefinements: {test_disjunctive: ['one', 'two']}
    });

    var queries = getQueries(searchParams.index, searchParams);

    expect(queries.length).toBe(2);
    expect(queries[0].params.facets).toEqual(['*']);
    expect(queries[1].params.facets).toEqual('test_disjunctive');
  });
});
