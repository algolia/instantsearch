'use strict';

var algoliasearchHelper = require('../../index');

test('Search should call the algolia client according to the number of refinements', function (done) {
  var testData = require('../datasets/SearchParameters/search.dataset')();

  var client = {
    search: jest.fn().mockImplementationOnce(function () {
      return Promise.resolve(testData.response);
    }),
  };

  var helper = algoliasearchHelper(client, 'test_hotels-node', {
    disjunctiveFacets: ['city'],
  });

  helper.addDisjunctiveFacetRefinement('city', 'Paris', true);
  helper.addDisjunctiveFacetRefinement('city', 'New York', true);

  helper.on('result', function (event) {
    var results = event.results;

    // shame deepclone, to remove any associated methods coming from the results
    expect(JSON.parse(JSON.stringify(results))).toEqual(
      JSON.parse(JSON.stringify(testData.responseHelper))
    );

    var cityValues = results.getFacetValues('city');
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

    var cityValuesCustom = results.getFacetValues('city', {
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

    var cityValuesFn = results.getFacetValues('city', {
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

    done();
  });

  helper.search('');
});

test('Search should not mutate the original client response', function (done) {
  var testData = require('../datasets/SearchParameters/search.dataset')();

  var client = {
    search: jest.fn().mockImplementationOnce(function () {
      return Promise.resolve(testData.response);
    }),
  };

  var helper = algoliasearchHelper(client, 'test_hotels-node');

  var originalResponseLength = testData.response.results.length;

  helper.on('result', function () {
    var currentResponseLength = testData.response.results.length;

    expect(currentResponseLength).toBe(originalResponseLength);

    done();
  });

  helper.search('');
});

test('no mutating methods should trigger a search', function () {
  var client = {
    search: jest.fn().mockImplementationOnce(function () {
      return new Promise(function () {});
    }),
  };

  var helper = algoliasearchHelper(client, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower'],
  });

  helper.setQuery('');
  helper.clearRefinements();
  helper.addDisjunctiveFacetRefinement('city', 'Paris');
  helper.removeDisjunctiveFacetRefinement('city', 'Paris');
  helper.addFacetExclusion('tower', 'Empire State Building');
  helper.removeExclude('tower', 'Empire State Building');
  helper.addFacetRefinement('tower', 'Empire State Building');
  helper.removeRefine('tower', 'Empire State Building');

  expect(client.search).toHaveBeenCalledTimes(0);

  helper.search();

  expect(client.search).toHaveBeenCalledTimes(1);
});
