'use strict';

var test = require('tape');
var SearchParameters = require('../../../src/SearchParameters');

test('_parseNumbers should convert to number all specified root keys', function(t) {
  var partialState = {
    aroundPrecision: '42',
    aroundRadius: '42',
    getRankingInfo: '42',
    minWordSizefor2Typos: '42',
    minWordSizefor1Typo: '42',
    page: '42',
    maxValuesPerFacet: '42',
    distinct: '42',
    minimumAroundRadius: '42',
    hitsPerPage: '42',
    minProximity: '42'
  };
  var actual = SearchParameters._parseNumbers(partialState);

  t.equal(actual.aroundPrecision, 42, 'aroundPrecision should be converted to number');
  t.equal(actual.aroundRadius, 42, 'aroundRadius should be converted to number');
  t.equal(actual.getRankingInfo, 42, 'getRankingInfo should be converted to number');
  t.equal(actual.minWordSizefor2Typos, 42, 'minWordSizeFor2Typos should be converted to number');
  t.equal(actual.minWordSizefor1Typo, 42, 'minWordSizeFor1Typo should be converted to number');
  t.equal(actual.page, 42, 'page should be converted to number');
  t.equal(actual.maxValuesPerFacet, 42, 'maxValuesPerFacet should be converted to number');
  t.equal(actual.distinct, 42, 'distinct should be converted to number');
  t.equal(actual.minimumAroundRadius, 42, 'minimumAroundRadius should be converted to number');
  t.equal(actual.hitsPerPage, 42, 'hitsPerPage should be converted to number');
  t.equal(actual.minProximity, 42, 'minProximity should be converted to number');

  t.end();
});

test('_parseNumbers should not convert undefined to NaN', function(t) {
  var partialState = {
    aroundPrecision: undefined
  };
  var actual = SearchParameters._parseNumbers(partialState);

  t.equal(actual.aroundPrecision, undefined);

  t.end();
});

test('_parseNumbers should convert numericRefinements values', function(t) {
  var partialState = {
    numericRefinements: {
      foo: {
        '>=': ['4.8', '15.16'],
        '=': ['23.42']
      }
    }
  };
  var actual = SearchParameters._parseNumbers(partialState);

  t.deepEqual(actual.numericRefinements.foo['>='], [4.8, 15.16], 'should convert foo >=');
  t.deepEqual(actual.numericRefinements.foo['='], [23.42], 'should convert foo =');

  t.end();
});

test('_parseNumbers should convert nested numericRefinements values', function(t) {
  var partialState = {
    numericRefinements: {
      foo: {
        '>=': [
          ['4.8'], '15.16'
        ],
        '=': ['23.42']
      }
    }
  };
  var actual = SearchParameters._parseNumbers(partialState);

  t.deepEqual(actual.numericRefinements.foo['>='], [
    [4.8], 15.16
  ], 'should convert foo >=');
  t.deepEqual(actual.numericRefinements.foo['='], [23.42], 'should convert foo =');

  t.end();
});
