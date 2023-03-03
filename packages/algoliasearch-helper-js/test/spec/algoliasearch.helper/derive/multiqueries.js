'use strict';

var algoliasearchHelper = require('../../../../index.js');

function makeFakeClient(assertions) {
  return {
    search: function() {
      assertions.apply(null, arguments);

      return new Promise(function() {});
    }
  };
}

test('trigger a search without derivation', function() {
  var client = makeFakeClient(assertions);
  var helper = algoliasearchHelper(client, '');

  helper.search();

  function assertions(requests) {
    expect(requests.length).toBe(1);
  }
});

test('trigger a search with one derivation without a state change', function() {
  var client = makeFakeClient(assertions);
  var helper = algoliasearchHelper(client, '');

  helper.derive(function(state) {
    return state;
  });

  helper.search();

  function assertions(requests) {
    expect(requests.length).toBe(2);
    expect(requests[0]).toEqual(requests[1]);
  }
});

test('trigger a search with one derivation with a state change', function() {
  var client = makeFakeClient(assertions);
  var helper = algoliasearchHelper(client, '');

  helper.derive(function(state) {
    return state.setQuery('otherQuery');
  });

  helper.search();

  function assertions(requests) {
    expect(requests.length).toBe(2);
    expect(requests[0].params.query).toBeUndefined();
    expect(requests[1].params.query).toBe('otherQuery');

    delete requests[0].params.query;
    delete requests[1].params.query;

    expect(requests[0]).toEqual(requests[1]);
  }
});

test('trigger a search with derivation only', function() {
  var client = makeFakeClient(assertions);
  var helper = algoliasearchHelper(client, '');

  helper.derive(function(state) {
    return state;
  });

  helper.searchOnlyWithDerivedHelpers();

  function assertions(requests) {
    expect(requests.length).toBe(1);
  }
});
