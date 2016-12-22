'use strict';

var test = require('tape');
var sinon = require('sinon');
var algoliaSearchHelper = require('../../../index');

var fakeClient = {
  addAlgoliaAgent: function() {}
};

test('Change events should be emitted as soon as the state change, but search should be triggered (refactored)', function(t) {
  var helper = algoliaSearchHelper(fakeClient, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower']
  });

  var count = 0;

  helper.on('change', function() {
    count++;
  });

  var stubbedSearch = sinon.stub(helper, '_search');

  helper.setQuery('');
  t.equal(count, 1, 'search');
  t.equal(stubbedSearch.callCount, 0, 'search');

  helper.clearRefinements();
  t.equal(count, 2, 'clearRefinements');
  t.equal(stubbedSearch.callCount, 0, 'clearRefinements');

  helper.addDisjunctiveRefine('city', 'Paris');
  t.equal(count, 3, 'addDisjunctiveRefine');
  t.equal(stubbedSearch.callCount, 0, 'addDisjunctiveRefine');

  helper.removeDisjunctiveRefine('city', 'Paris');
  t.equal(count, 4, 'removeDisjunctiveRefine');
  t.equal(stubbedSearch.callCount, 0, 'removeDisjunctiveRefine');

  helper.addExclude('tower', 'Empire State Building');
  t.equal(count, 5, 'addExclude');
  t.equal(stubbedSearch.callCount, 0, 'addExclude');

  helper.removeExclude('tower', 'Empire State Building');
  t.equal(count, 6, 'removeExclude');
  t.equal(stubbedSearch.callCount, 0, 'removeExclude');

  helper.addRefine('tower', 'Empire State Building');
  t.equal(count, 7, 'addRefine');
  t.equal(stubbedSearch.callCount, 0, 'addRefine');

  helper.removeRefine('tower', 'Empire State Building');
  t.equal(count, 8, 'removeRefine');
  t.equal(stubbedSearch.callCount, 0, 'removeRefine');

  helper.search();
  t.equal(count, 8, "final search doesn't call the change");
  t.equal(stubbedSearch.callCount, 1, 'final search triggers the search');

  t.end();
});

test('search event should be emitted once when the search is triggered and before the request is sent', function(t) {
  var clientMock = {addAlgoliaAgent: function() {}};
  var helper = algoliaSearchHelper(clientMock, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower']
  });

  var count = 0;

  helper.on('search', function() {
    count++;
  });

  clientMock.search = function() {
    t.equal(
      count,
      1,
      'When the client search function is called the search' +
      ' event should have been sent exactly once.');
  };

  helper.setQuery('');
  t.equal(count, 0, 'search');

  helper.clearRefinements();
  t.equal(count, 0, 'clearRefinements');

  helper.addDisjunctiveRefine('city', 'Paris');
  t.equal(count, 0, 'addDisjunctiveRefine');

  helper.removeDisjunctiveRefine('city', 'Paris');
  t.equal(count, 0, 'removeDisjunctiveRefine');

  helper.addExclude('tower', 'Empire State Building');
  t.equal(count, 0, 'addExclude');

  helper.removeExclude('tower', 'Empire State Building');
  t.equal(count, 0, 'removeExclude');

  helper.addRefine('tower', 'Empire State Building');
  t.equal(count, 0, 'addRefine');

  helper.removeRefine('tower', 'Empire State Building');
  t.equal(count, 0, 'removeRefine');

  helper.search();
  t.equal(count, 1, 'final search does trigger the search event');

  t.end();
});
