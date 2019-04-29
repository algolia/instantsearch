'use strict';

var forEach = require('lodash/forEach');

var SearchParameters = require('../../../src/SearchParameters');

var stateWithStringForIntegers = {
  minWordSizefor1Typo: '1',
  minWordSizefor2Typos: '2',
  minProximity: '2',
  page: '10',
  hitsPerPage: '500',
  getRankingInfo: '1',
  distinct: '1',
  maxValuesPerFacet: '10',
  aroundRadius: '10',
  aroundPrecision: '2',
  minimumAroundRadius: '234'
};

test('Constructor should parse the numeric attributes', function() {
  var state = new SearchParameters(stateWithStringForIntegers);

  forEach(stateWithStringForIntegers, function(v, k) {
    var parsedValue = parseFloat(v);
    expect(state[k]).toBe(parsedValue);
  });
});

test('setQueryParameter should parse the numeric attributes', function() {
  var state0 = new SearchParameters();

  forEach(stateWithStringForIntegers, function(v, k) {
    var parsedValue = parseFloat(v);
    var state1 = state0.setQueryParameter(k, v);
    expect(state1[k]).toBe(parsedValue);
  });
});

test('setQueryParameters should parse the numeric attributes', function() {
  var state0 = new SearchParameters();
  var state1 = state0.setQueryParameters(stateWithStringForIntegers);

  forEach(stateWithStringForIntegers, function(v, k) {
    var parsedValue = parseFloat(v);
    expect(state1[k]).toBe(parsedValue);
  });
});
