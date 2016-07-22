'use strict';

var test = require('tape');
var forOwn = require('lodash/forOwn');
var SearchParameters = require('../../../src/SearchParameters');

test('setQueryParameters should be able to mix an actual state with a new set of parameters', function(t) {
  var originalSP = new SearchParameters({
    facets: ['a', 'b'],
    ignorePlurals: false,
    attributesToHighlight: ''
  });

  var params = {
    facets: ['a', 'c'],
    attributesToHighlight: ['city', 'country'],
    replaceSynonymsInHighlight: true
  };
  var newSP = originalSP.setQueryParameters(params);

  t.deepEquals(newSP.facets, params.facets, 'Facets should be updated (existing parameter)');
  t.deepEquals(newSP.attributesToHighlight, newSP.attributesToHighlight, 'attributesToHighlight should be updated (existing parameter)');
  t.equal(newSP.replaceSynonymsInHighlight, newSP.replaceSynonymsInHighlight, 'replaceSynonymsInHighlight should be updated (new parameter)');
  t.equal(newSP.ignorePlurals, originalSP.ignorePlurals, 'ignorePlurals should be the same as the original');

  t.end();
});

test('setQueryParameters should add unknown properties', function(t) {
  var state0 = new SearchParameters({
    facets: ['a', 'b'],
    ignorePlurals: false,
    attributesToHighlight: ''
  });

  var params = {
    unknow1: ['a', 'c'],
    facet: ['city', 'country']
  };

  var state1 = state0.setQueryParameters(params);

  forOwn(params, function(v, k) {
    t.deepEquals(state1[k], v);
  });

  t.end();
});
