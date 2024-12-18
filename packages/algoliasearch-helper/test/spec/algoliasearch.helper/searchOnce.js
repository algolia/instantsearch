'use strict';

var algoliasearchHelper = require('../../../index');
var SearchParameters = require('../../../src/SearchParameters');

test('searchOnce should call the algolia client according to the number of refinements and call callback with no error and with results when no error', async function () {
  var testData = require('../../datasets/SearchParameters/search.dataset')();

  var client = {
    search: jest.fn().mockImplementationOnce(function () {
      return Promise.resolve(testData.response);
    }),
  };

  var helper = algoliasearchHelper(client, 'test_hotels-node');

  var parameters = new SearchParameters({
    disjunctiveFacets: ['city'],
  })
    .setIndex('test_hotels-node')
    .addDisjunctiveFacetRefinement('city', 'Paris')
    .addDisjunctiveFacetRefinement('city', 'New York');

  const { content } = await helper.searchOnce(parameters);

  // shame deepclone, to remove any associated methods coming from the results
  expect(JSON.parse(JSON.stringify(content))).toEqual(
    JSON.parse(JSON.stringify(testData.responseHelper))
  );

  var cityValues = content.getFacetValues('city');
  var expectedCityValues = [
    { name: 'Paris', escapedValue: 'Paris', count: 3, isRefined: true },
    { name: 'New York', escapedValue: 'New York', count: 1, isRefined: true },
    {
      name: 'San Francisco',
      escapedValue: 'San Francisco',
      count: 1,
      isRefined: false,
    },
  ];

  expect(cityValues).toEqual(expectedCityValues);

  var cityValuesCustom = content.getFacetValues('city', {
    sortBy: ['count:asc', 'name:asc'],
  });
  var expectedCityValuesCustom = [
    { name: 'New York', escapedValue: 'New York', count: 1, isRefined: true },
    {
      name: 'San Francisco',
      escapedValue: 'San Francisco',
      count: 1,
      isRefined: false,
    },
    { name: 'Paris', escapedValue: 'Paris', count: 3, isRefined: true },
  ];

  expect(cityValuesCustom).toEqual(expectedCityValuesCustom);

  var cityValuesFn = content.getFacetValues('city', {
    sortBy: function (a, b) {
      return a.count - b.count;
    },
  });
  var expectedCityValuesFn = [
    { name: 'New York', escapedValue: 'New York', count: 1, isRefined: true },
    {
      name: 'San Francisco',
      escapedValue: 'San Francisco',
      count: 1,
      isRefined: false,
    },
    { name: 'Paris', escapedValue: 'Paris', count: 3, isRefined: true },
  ];

  expect(cityValuesFn).toEqual(expectedCityValuesFn);

  expect(client.search).toHaveBeenCalledTimes(1);

  var queries = client.search.mock.calls[0][0];
  for (var i = 0; i < queries.length; i++) {
    var query = queries[i];
    expect(query.query).toBeUndefined();
    expect(query.params.query).toBeUndefined();
  }
});

test('searchOnce should call the algolia client according to the number of refinements and call callback with error and no results when error', async function () {
  var error = { message: 'error' };
  var client = {
    search: jest.fn().mockImplementationOnce(function () {
      return Promise.reject(error);
    }),
  };

  var helper = algoliasearchHelper(client, 'test_hotels-node');

  var parameters = new SearchParameters({
    disjunctiveFacets: ['city'],
  })
    .setIndex('test_hotels-node')
    .addDisjunctiveFacetRefinement('city', 'Paris')
    .addDisjunctiveFacetRefinement('city', 'New York');

  await expect(() => helper.searchOnce(parameters)).rejects.toEqual(error);

  expect(client.search).toHaveBeenCalledTimes(1);

  var queries = client.search.mock.calls[0][0];
  for (var i = 0; i < queries.length; i++) {
    var query = queries[i];
    expect(query.query).toBeUndefined();
    expect(query.params.query).toBeUndefined();
  }
});
