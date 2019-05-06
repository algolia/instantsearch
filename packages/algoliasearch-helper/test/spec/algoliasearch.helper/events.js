'use strict';

var algoliaSearchHelper = require('../../../index');

function makeFakeClient() {
  return {
    search: jest.fn(function() {
      return new Promise(function() {});
    }),
    searchForFacetValues: jest.fn(function() {
      return new Promise(function() {});
    })
  };
}

test('Change events should be emitted with reset page to true on implicit reset methods', function() {
  var changed = jest.fn();
  var fakeClient = makeFakeClient();
  var helper = algoliaSearchHelper(fakeClient, 'Index');

  helper.on('change', changed);

  expect(changed).toHaveBeenCalledTimes(0);

  // Trigger a page reset
  helper.setQuery('Apple');

  expect(changed).toHaveBeenCalledTimes(1);
  expect(changed).toHaveBeenLastCalledWith({
    state: expect.any(algoliaSearchHelper.SearchParameters),
    results: null,
    isPageReset: true
  });

  // Trigger a page reset
  helper.setQueryParameter('hitsPerPage', 10);

  expect(changed).toHaveBeenCalledTimes(2);
  expect(changed).toHaveBeenLastCalledWith({
    state: expect.any(algoliaSearchHelper.SearchParameters),
    results: null,
    isPageReset: true
  });
});

test('Change events should be emitted with reset page to false on regular methods', function() {
  var changed = jest.fn();
  var fakeClient = makeFakeClient();
  var helper = algoliaSearchHelper(fakeClient, 'Index');

  helper.on('change', changed);

  expect(changed).toHaveBeenCalledTimes(0);

  // Don't trigger a page reset
  helper.setPage(22);

  expect(changed).toHaveBeenCalledTimes(1);
  expect(changed).toHaveBeenLastCalledWith({
    state: expect.any(algoliaSearchHelper.SearchParameters),
    results: null,
    isPageReset: false
  });

  // Don't trigger a page reset
  helper.setState({
    query: 'Apple',
    page: 22
  });

  expect(changed).toHaveBeenCalledTimes(2);
  expect(changed).toHaveBeenLastCalledWith({
    state: expect.any(algoliaSearchHelper.SearchParameters),
    results: null,
    isPageReset: false
  });
});

test('Change events should be emitted as soon as the state change, but search should be triggered (refactored)', function() {
  var fakeClient = makeFakeClient();
  var helper = algoliaSearchHelper(fakeClient, 'Index', {
    disjunctiveFacets: ['city'],
    disjunctiveFacetsRefinements: {city: ['Paris']},
    facets: ['tower'],
    facetsRefinements: {tower: ['Empire State Building']},
    facetsExcludes: {tower: ['Empire State Building']},
    hierarchicalFacets: [],
    numericRefinements: {
      price: {'>': [300]}
    }
  });

  var changeEventCount = 0;

  helper.on('change', function() {
    changeEventCount++;
  });

  helper.setQuery('a');
  expect(changeEventCount).toBe(1);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.clearRefinements();
  expect(changeEventCount).toBe(2);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addDisjunctiveRefine('city', 'Paris');
  expect(changeEventCount).toBe(3);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeDisjunctiveRefine('city', 'Paris');
  expect(changeEventCount).toBe(4);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addExclude('tower', 'Empire State Building');
  expect(changeEventCount).toBe(5);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeExclude('tower', 'Empire State Building');
  expect(changeEventCount).toBe(6);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addRefine('tower', 'Empire State Building');
  expect(changeEventCount).toBe(7);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeRefine('tower', 'Empire State Building');
  expect(changeEventCount).toBe(8);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.search();
  expect(changeEventCount).toBe(8);
  expect(fakeClient.search).toHaveBeenCalledTimes(1);
});

test('Change events should only be emitted for meaningful changes', function() {
  var fakeClient = makeFakeClient();
  var helper = algoliaSearchHelper(fakeClient, 'Index', {
    query: 'a',
    disjunctiveFacets: ['city'],
    disjunctiveFacetsRefinements: {city: ['Paris']},
    facets: ['tower'],
    facetsRefinements: {tower: ['Empire State Building']},
    facetsExcludes: {tower: ['Empire State Building']},
    hierarchicalFacets: [{
      name: 'hierarchicalFacet',
      attributes: ['lvl1', 'lvl2']
    }],
    numericRefinements: {
      price: {'>': [300]}
    }
  });

  var changeEventCount = 0;

  helper.on('change', function() {
    changeEventCount++;
  });

  helper.setQuery('a');
  expect(changeEventCount).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addDisjunctiveRefine('city', 'Paris');
  expect(changeEventCount).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addExclude('tower', 'Empire State Building');
  expect(changeEventCount).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addRefine('tower', 'Empire State Building');
  expect(changeEventCount).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addNumericRefinement('price', '>', 300);
  expect(changeEventCount).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  // This is an actual change
  helper.clearRefinements();
  expect(changeEventCount).toBe(1);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.clearRefinements();
  expect(changeEventCount).toBe(1);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeDisjunctiveRefine('city', 'Paris');
  expect(changeEventCount).toBe(1);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeExclude('tower', 'Empire State Building');
  expect(changeEventCount).toBe(1);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeRefine('tower', 'Empire State Building');
  expect(changeEventCount).toBe(1);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.search();
  expect(changeEventCount).toBe(1);
  expect(fakeClient.search).toHaveBeenCalledTimes(1);
});

test('search event should be emitted once when the search is triggered and before the request is sent', function() {
  var fakeClient = makeFakeClient();
  var helper = algoliaSearchHelper(fakeClient, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower']
  });

  var count = 0;

  helper.on('search', function() {
    count++;
  });

  helper.setQuery('');
  expect(count).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.clearRefinements();
  expect(count).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addDisjunctiveRefine('city', 'Paris');
  expect(count).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeDisjunctiveRefine('city', 'Paris');
  expect(count).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addExclude('tower', 'Empire State Building');
  expect(count).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeExclude('tower', 'Empire State Building');
  expect(count).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.addRefine('tower', 'Empire State Building');
  expect(count).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.removeRefine('tower', 'Empire State Building');
  expect(count).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.search();
  expect(count).toBe(1);
  expect(fakeClient.search).toHaveBeenCalledTimes(1);
});

test('searchOnce event should be emitted once when the search is triggered using searchOnce and before the request is sent', function() {
  var fakeClient = makeFakeClient();
  var helper = algoliaSearchHelper(fakeClient, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower']
  });

  var count = 0;

  helper.on('searchOnce', function() {
    count++;
  });

  expect(count).toBe(0);
  expect(fakeClient.search).toHaveBeenCalledTimes(0);

  helper.searchOnce({}, function() {});
  expect(count).toBe(1);
  expect(fakeClient.search).toHaveBeenCalledTimes(1);
});

test('searchForFacetValues event should be emitted once when the search is triggered using' +
     ' searchForFacetValues and before the request is sent', function() {
  var fakeClient = makeFakeClient();
  var helper = algoliaSearchHelper(fakeClient, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower']
  });

  var count = 0;

  helper.on('searchForFacetValues', function() {
    count++;
  });

  expect(count).toBe(0);
  expect(fakeClient.searchForFacetValues).toHaveBeenCalledTimes(0);

  helper.searchForFacetValues();
  expect(count).toBe(1);
  expect(fakeClient.searchForFacetValues).toHaveBeenCalledTimes(1);
});
