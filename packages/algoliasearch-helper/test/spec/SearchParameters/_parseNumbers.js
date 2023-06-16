'use strict';

var SearchParameters = require('../../../src/SearchParameters');

test('_parseNumbers should convert to number all specified root keys (that are parseable)', function () {
  var partialState = {
    aroundPrecision: '42',
    aroundRadius: '42',
    getRankingInfo: '42',
    insideBoundingBox: [
      ['51.1241999', '9.662499900000057', '41.3253001', '-5.559099999999944'],
    ],
    minWordSizefor2Typos: '42',
    minWordSizefor1Typo: '42',
    page: '42',
    maxValuesPerFacet: '42',
    distinct: '42',
    minimumAroundRadius: '42',
    hitsPerPage: '42',
    minProximity: '42',
  };
  var actual = SearchParameters._parseNumbers(partialState);

  expect(actual.aroundPrecision).toBe(42);
  expect(actual.aroundRadius).toBe(42);
  expect(actual.getRankingInfo).toBe(42);
  expect(actual.insideBoundingBox).toEqual([
    [51.1241999, 9.662499900000057, 41.3253001, -5.559099999999944],
  ]);
  expect(actual.minWordSizefor2Typos).toBe(42);
  expect(actual.minWordSizefor1Typo).toBe(42);
  expect(actual.page).toBe(42);
  expect(actual.maxValuesPerFacet).toBe(42);
  expect(actual.distinct).toBe(42);
  expect(actual.minimumAroundRadius).toBe(42);
  expect(actual.hitsPerPage).toBe(42);
  expect(actual.minProximity).toBe(42);
});

test('_parseNumbers should not convert undefined to NaN', function () {
  var partialState = {
    aroundPrecision: undefined,
  };
  var actual = SearchParameters._parseNumbers(partialState);

  expect(actual.aroundPrecision).toBe(undefined);
});

test("_parseNumbers should not convert insideBoundingBox if it's a string", function () {
  var partialState = {
    insideBoundingBox: '5,4,5,4',
  };
  var actual = SearchParameters._parseNumbers(partialState);

  expect(actual.insideBoundingBox).toBe('5,4,5,4');
});

test('_parseNumbers should leave insideBoundingBox as-is if not nested array', function () {
  var partialState = {
    insideBoundingBox: ['5', '4', '5', '4'],
  };
  var actual = SearchParameters._parseNumbers(partialState);

  expect(actual.insideBoundingBox).toEqual(['5', '4', '5', '4']);
});

test('_parseNumbers should not convert unparseable strings', function () {
  var partialState = {
    aroundRadius: 'all',
  };
  var actual = SearchParameters._parseNumbers(partialState);

  expect(actual.aroundRadius).toBe('all');
});

test('_parseNumbers should convert numericRefinements values', function () {
  var partialState = {
    numericRefinements: {
      foo: {
        '>=': ['4.8', '15.16'],
        '=': ['23.42'],
      },
    },
  };
  var actual = SearchParameters._parseNumbers(partialState);

  expect(actual.numericRefinements.foo['>=']).toEqual([4.8, 15.16]);
  expect(actual.numericRefinements.foo['=']).toEqual([23.42]);
});

test('_parseNumbers should convert nested numericRefinements values', function () {
  var partialState = {
    numericRefinements: {
      foo: {
        '>=': [['4.8'], '15.16'],
        '=': ['23.42'],
      },
    },
  };
  var actual = SearchParameters._parseNumbers(partialState);

  expect(actual.numericRefinements.foo['>=']).toEqual([[4.8], 15.16]);
  expect(actual.numericRefinements.foo['=']).toEqual([23.42]);
});
