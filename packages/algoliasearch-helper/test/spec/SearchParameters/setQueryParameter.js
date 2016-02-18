'use strict';

var test = require('tape');
var SearchParameters = require('../../../src/SearchParameters');

test('setqueryparameter should update existing parameter', function(t) {
  var sp = new SearchParameters({
    facets: ['facet']
  });

  var newValue = [];
  var newsp = sp.setQueryParameter('facets', newValue);

  t.deepEquals(newsp.facets, newValue, 'update of an existing parameter');

  t.end();
});

test('setqueryparameter should add non-existing parameter', function(t) {
  var sp = new SearchParameters({
    facets: ['facet']
  });

  var newValue = ['attributesToHighlight'];
  var newsp = sp.setQueryParameter('attributesToHighlight', newValue);

  t.deepEquals(newsp.attributesToHighlight, newValue, 'add new parameter');

  t.end();
});

test('setQueryParameter should not create a new instance if the update is non effective', function(t) {
  var sp = new SearchParameters({
    facets: ['facet'],
    maxValuesPerFacet: 10
  });

  var newValue = 10;
  var newsp = sp.setQueryParameter('maxValuesPerFacet', newValue);

  t.deepEquals(newsp, sp, 'No change should result in the same instance');

  t.end();
});

test(
  'setQueryParameter should not throw an error when trying to add an unknown parameter, and actually add it',
  function(t) {
    var state0 = new SearchParameters();

    var state1 = state0.setQueryParameter('betaParameter', 'configValue');
    // manual test that the warnonce message actually display message once
    state0.setQueryParameter('betaParameter', 'configValue');
    t.deepEquals(state1.betaParameter, 'configValue');

    t.end();
  }
);
