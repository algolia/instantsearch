'use strict';

var mergeNumericMax = require('../../../src/functions/mergeNumericMax');

// tests modified from defaultsPure

it('should assign source properties if missing on `object`', function () {
  var actual = mergeNumericMax({ a: 1 }, { a: 1, b: 2 });
  expect(actual).toEqual({ a: 1, b: 2 });
});

it('should override with higher value', function () {
  var actual = mergeNumericMax({ a: 1 }, { a: 2, b: 2 });
  expect(actual).toEqual({ a: 2, b: 2 });
});

it('should accept multiple sources', function () {
  expect(mergeNumericMax({ a: 1, b: 2 }, { b: 3 }, { c: 3 })).toEqual({
    a: 1,
    b: 3,
    c: 3,
  });

  expect(mergeNumericMax({ a: 1, b: 2 }, { b: 3, c: 3 }, { c: 2 })).toEqual({
    a: 1,
    b: 3,
    c: 3,
  });
});

it('should overwrite `null` values', function () {
  var actual = mergeNumericMax({ a: null }, { a: 1 });
  expect(actual.a).toBe(1);
});

it('should overwrite `undefined` values', function () {
  var actual = mergeNumericMax({ a: undefined }, { a: 1 });
  expect(actual.a).toBe(1);
});

it('should assign `undefined` values', function () {
  var source = { a: undefined, b: 1 };
  var actual = mergeNumericMax({}, source);

  expect(actual).toEqual({ a: undefined, b: 1 });
});

it('should assign properties that shadow those on `Object.prototype`', function () {
  expect(
    mergeNumericMax(
      {},
      {
        constructor: 1,
        hasOwnProperty: 2,
        isPrototypeOf: 3,
        propertyIsEnumerable: 4,
        toLocaleString: 5,
        toString: 6,
        valueOf: 7,
      }
    )
  ).toEqual({
    constructor: 1,
    hasOwnProperty: 2,
    isPrototypeOf: 3,
    propertyIsEnumerable: 4,
    toLocaleString: 5,
    toString: 6,
    valueOf: 7,
  });

  expect(
    mergeNumericMax(
      {},
      {
        constructor: Object.prototype.constructor,
        hasOwnProperty: Object.prototype.hasOwnProperty,
        isPrototypeOf: Object.prototype.isPrototypeOf,
        propertyIsEnumerable: Object.prototype.propertyIsEnumerable,
        toLocaleString: Object.prototype.toLocaleString,
        toString: Object.prototype.toString,
        valueOf: Object.prototype.valueOf,
      },
      {
        constructor: 1,
        hasOwnProperty: 2,
        isPrototypeOf: 3,
        propertyIsEnumerable: 4,
        toLocaleString: 5,
        toString: 6,
        valueOf: 7,
      }
    )
  ).toEqual({
    constructor: 1,
    hasOwnProperty: 2,
    isPrototypeOf: 3,
    propertyIsEnumerable: 4,
    toLocaleString: 5,
    toString: 6,
    valueOf: 7,
  });
});

it('should keep the keys order with facets', function () {
  var actual = mergeNumericMax(
    {},
    {
      'Insignia™': 551,
      Samsung: 511,
      Apple: 386,
    },
    {
      Apple: 386,
    }
  );
  expect(Object.keys(actual)).toEqual(['Insignia™', 'Samsung', 'Apple']);
});

it('does not pollute the prototype', () => {
  var payload = JSON.parse('{"__proto__": {"polluted": "vulnerable to PP"}}');
  var subject = {};

  expect(subject.polluted).toBe(undefined);

  const out = mergeNumericMax({}, payload);

  expect(out).toEqual({});

  expect({}.polluted).toBe(undefined);
});
