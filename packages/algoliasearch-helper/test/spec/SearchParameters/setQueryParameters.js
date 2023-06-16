'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('setQueryParameters should return the same instance if the options is falsey', function () {
  var state = new SearchParameters({
    facets: ['a', 'b'],
    ignorePlurals: false,
    attributesToHighlight: '',
  });

  expect(state).toBe(state.setQueryParameters());
  expect(state).toBe(state.setQueryParameters(null));
  expect(state).toBe(state.setQueryParameters(undefined));
});

test('setQueryParameters should be able to mix an actual state with a new set of parameters', function () {
  var state0 = new SearchParameters({
    facets: ['a', 'b'],
    ignorePlurals: false,
    attributesToHighlight: '',
  });

  var params = {
    facets: ['a', 'c'],
    attributesToHighlight: ['city', 'country'],
    replaceSynonymsInHighlight: true,
  };

  var state1 = state0.setQueryParameters(params);

  expect(state1).toEqual(
    new SearchParameters({
      facets: ['a', 'c'],
      ignorePlurals: false,
      attributesToHighlight: ['city', 'country'],
      replaceSynonymsInHighlight: true,
    })
  );
});

test('setQueryParameters should add unknown properties', function () {
  var state0 = new SearchParameters({
    facets: ['a', 'b'],
    ignorePlurals: false,
    attributesToHighlight: '',
  });

  var params = {
    unknow1: ['a', 'c'],
    facet: ['city', 'country'],
  };

  var state1 = state0.setQueryParameters(params);

  expect(state1).toEqual(
    new SearchParameters({
      facets: ['a', 'b'],
      ignorePlurals: false,
      attributesToHighlight: '',
      unknow1: ['a', 'c'],
      facet: ['city', 'country'],
    })
  );
});

test('setQueryParameters should ignore undefined parameters without previous values', function () {
  var state0 = new SearchParameters({
    aroundLatLng: '10,12',
  });

  var state1 = state0.setQueryParameters({
    query: undefined,
    page: undefined,
  });

  expect(state1).not.toHaveProperty('query');
  expect(state1).not.toHaveProperty('page');
});

test('setQueryParameters should omit defined parameters with next values of undefined', function () {
  var state0 = new SearchParameters({
    aroundLatLng: '10,12',
    query: 'Apple',
    page: 5,
  });

  var state1 = state0.setQueryParameters({
    query: undefined,
    page: undefined,
  });

  expect(state1).not.toHaveProperty('query');
  expect(state1).not.toHaveProperty('page');
});

test('setQueryParameters should warn about invalid userToken', function () {
  const message =
    '[algoliasearch-helper] The `userToken` parameter is invalid. This can lead to wrong analytics.\n  - Format: [a-zA-Z0-9_-]{1,64}';
  console.warn = jest.fn();

  var state = new SearchParameters();
  state.setQueryParameters({ userToken: null });
  expect(console.warn).toHaveBeenCalledTimes(1);
  expect(console.warn).toHaveBeenLastCalledWith(message);

  state.setQueryParameters({ userToken: '' });
  expect(console.warn).toHaveBeenCalledTimes(2);
  expect(console.warn).toHaveBeenLastCalledWith(message);

  state.setQueryParameters({ userToken: 'my invalid token!' });
  expect(console.warn).toHaveBeenCalledTimes(3);
  expect(console.warn).toHaveBeenLastCalledWith(message);
});
