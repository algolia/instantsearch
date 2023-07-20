'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('setqueryparameter should update existing parameter', function () {
  var sp = new SearchParameters({
    facets: ['facet'],
  });

  var newValue = [];
  var newsp = sp.setQueryParameter('facets', newValue);

  expect(newsp.facets).toEqual(newValue);
});

test('setqueryparameter should add non-existing parameter', function () {
  var sp = new SearchParameters({
    facets: ['facet'],
  });

  var newValue = ['attributesToHighlight'];
  var newsp = sp.setQueryParameter('attributesToHighlight', newValue);

  expect(newsp.attributesToHighlight).toEqual(newValue);
});

test('setQueryParameter should not create a new instance if the update is non effective', function () {
  var sp = new SearchParameters({
    facets: ['facet'],
    maxValuesPerFacet: 10,
  });

  var newValue = 10;
  var newsp = sp.setQueryParameter('maxValuesPerFacet', newValue);

  expect(newsp).toEqual(sp);
});

test('setQueryParameter should not throw an error when trying to add an unknown parameter, and actually add it', function () {
  var state0 = new SearchParameters();

  var state1 = state0.setQueryParameter('betaParameter', 'configValue');
  // manual test that the warnonce message actually display message once
  state0.setQueryParameter('betaParameter', 'configValue');
  expect(state1.betaParameter).toEqual('configValue');
});

test('setQueryParameter should warn about invalid userToken', function () {
  const message =
    '[algoliasearch-helper] The `userToken` parameter is invalid. This can lead to wrong analytics.\n  - Format: [a-zA-Z0-9_-]{1,64}';
  console.warn = jest.fn();

  var state = new SearchParameters();
  state.setQueryParameter('userToken', null);
  expect(console.warn).toHaveBeenCalledTimes(1);
  expect(console.warn).toHaveBeenLastCalledWith(message);

  state.setQueryParameter('userToken', '');
  expect(console.warn).toHaveBeenCalledTimes(2);
  expect(console.warn).toHaveBeenLastCalledWith(message);

  state.setQueryParameter('userToken', 'my invalid token!');
  expect(console.warn).toHaveBeenCalledTimes(3);
  expect(console.warn).toHaveBeenLastCalledWith(message);
});
