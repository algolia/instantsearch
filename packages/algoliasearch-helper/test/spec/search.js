'use strict';

var test = require('tape');
var sinon = require('sinon');
var algoliaSearch = require('algoliasearch');

var algoliasearchHelper = require('../../index');

test('Search should call the algolia client according to the number of refinements', function(t) {
  var testData = require('./search.testdata.js')();

  var client = algoliaSearch('dsf', 'dsfdf');
  var mock = sinon.mock(client);

  mock.expects('search').once().resolves(testData.response);

  var helper = algoliasearchHelper(client, 'test_hotels-node', {
    disjunctiveFacets: ['city']
  });

  helper.addDisjunctiveRefine('city', 'Paris', true);
  helper.addDisjunctiveRefine('city', 'New York', true);

  helper.on('result', function(data) {
    // shame deepclone, to remove any associated methods coming from the results
    t.deepEqual(
      JSON.parse(JSON.stringify(data)),
      JSON.parse(JSON.stringify(testData.responseHelper)),
      'should be equal'
    );

    var cityValues = data.getFacetValues('city');
    var expectedCityValues = [
      {name: 'Paris', count: 3, isRefined: true},
      {name: 'New York', count: 1, isRefined: true},
      {name: 'San Francisco', count: 1, isRefined: false}
    ];

    t.deepEqual(
      cityValues,
      expectedCityValues,
      'Facet values for "city" should be correctly ordered using the default sort');

    var cityValuesCustom = data.getFacetValues('city', {sortBy: ['count:asc', 'name:asc']});
    var expectedCityValuesCustom = [
      {name: 'New York', count: 1, isRefined: true},
      {name: 'San Francisco', count: 1, isRefined: false},
      {name: 'Paris', count: 3, isRefined: true}
    ];


    t.deepEqual(
      cityValuesCustom,
      expectedCityValuesCustom,
      'Facet values for "city" should be correctly ordered using a custom sort');

    var cityValuesFn = data.getFacetValues('city', {sortBy: function(a, b) { return a.count - b.count; }});
    var expectedCityValuesFn = [
      {name: 'New York', count: 1, isRefined: true},
      {name: 'San Francisco', count: 1, isRefined: false},
      {name: 'Paris', count: 3, isRefined: true}
    ];

    t.deepEqual(
      cityValuesFn,
      expectedCityValuesFn,
      'Facet values for "city" should be correctly ordered using a sort function');

    var queries = mock.expectations.search[0].args[0][0];
    for (var i = 0; i < queries.length; i++) {
      var query = queries[i];
      t.equal(query.query, undefined);
      t.equal(query.params.query, '');
    }
    t.ok(mock.verify(), 'Mock constraints should be verified!');

    t.end();
  });

  helper.search('');
});

test('Search should not mutate the original client response', function(t) {
  var testData = require('./search.testdata.js')();

  var client = algoliaSearch('dsf', 'dsfdf');
  var mock = sinon.mock(client);

  mock.expects('search').once().resolves(testData.response);

  var helper = algoliasearchHelper(client, 'test_hotels-node');

  var originalResponseLength = testData.response.results.length;

  helper.on('result', function() {
    var currentResponseLength = testData.response.results.length;

    t.equal(currentResponseLength, originalResponseLength);

    t.end();
  });

  helper.search('');
});

test('no mutating methods should trigger a search', function(t) {
  var client = algoliaSearch('dsf', 'dsfdf');
  sinon.mock(client);

  var helper = algoliasearchHelper(client, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower']
  });

  var stubbedSearch = sinon.stub(helper, '_search');

  helper.setQuery('');
  helper.clearRefinements();
  helper.addDisjunctiveRefine('city', 'Paris');
  helper.removeDisjunctiveRefine('city', 'Paris');
  helper.addExclude('tower', 'Empire State Building');
  helper.removeExclude('tower', 'Empire State Building');
  helper.addRefine('tower', 'Empire State Building');
  helper.removeRefine('tower', 'Empire State Building');

  t.equal(stubbedSearch.callCount, 0, 'should not have triggered calls');

  helper.search();

  t.equal(stubbedSearch.callCount, 1, 'should have triggered a single search');

  t.end();
});
