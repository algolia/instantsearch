'use strict';

var clone = require('lodash/clone');
var defaults = require('../../../src/functions/defaultsPure');

// tests modified from lodash source

it('should assign source properties if missing on `object`', function() {
  var actual = defaults({'a': 1}, {'a': 2, 'b': 2});
  expect(actual).toEqual({'a': 1, 'b': 2});
});

it('should accept multiple sources', function() {
  var expected = {'a': 1, 'b': 2, 'c': 3};
  var actual = defaults({'a': 1, 'b': 2}, {'b': 3}, {'c': 3});

  expect(actual).toEqual(expected);

  actual = defaults({'a': 1, 'b': 2}, {'b': 3, 'c': 3}, {'c': 2});
  expect(actual).toEqual(expected);
});

it('should not overwrite `null` values', function() {
  var actual = defaults({'a': null}, {'a': 1});
  expect(actual.a).toBe(null);
});

it('should overwrite `undefined` values', function() {
  var actual = defaults({'a': undefined}, {'a': 1});
  expect(actual.a).toBe(1);
});

it('should assign `undefined` values', function() {
  var source = {'a': undefined, 'b': 1};
  var actual = defaults({}, source);

  expect(actual).toEqual({'a': undefined, 'b': 1});
});

it('should assign properties that shadow those on `Object.prototype`', function() {
  var object = {
    'constructor': Object.prototype.constructor,
    'hasOwnProperty': Object.prototype.hasOwnProperty,
    'isPrototypeOf': Object.prototype.isPrototypeOf,
    'propertyIsEnumerable': Object.prototype.propertyIsEnumerable,
    'toLocaleString': Object.prototype.toLocaleString,
    'toString': Object.prototype.toString,
    'valueOf': Object.prototype.valueOf
  };

  var source = {
    'constructor': 1,
    'hasOwnProperty': 2,
    'isPrototypeOf': 3,
    'propertyIsEnumerable': 4,
    'toLocaleString': 5,
    'toString': 6,
    'valueOf': 7
  };

  var expected = clone(source);
  expect(defaults({}, source)).toEqual(expected);

  expected = clone(object);
  expect(defaults({}, object, source)).toEqual(expected);
});

it('should keep the keys order with facets', function() {
  var actual = defaults(
    {},
    {
      'Insignia™': 551,
      'Samsung': 511,
      'Apple': 386
    },
    {
      'Apple': 386
    }
  );
  expect(Object.keys(actual)).toEqual(['Insignia™', 'Samsung', 'Apple']);
});

it('should keep the keys order when adding facet refinements', function() {
  var actual = defaults(
    {},
    {
      'facet2': ['facetValue']
    },
    {
      'facet1': ['facetValue']
    }
  );
  expect(Object.keys(actual)).toEqual(['facet1', 'facet2']);
});

it('does not pollute the prototype', () => {
  var payload = JSON.parse('{"__proto__": {"polluted": "vulnerable to PP"}}');
  var subject = {};

  expect(subject.polluted).toBe(undefined);

  const out = defaults({}, payload);

  expect(out).toEqual({});

  expect({}.polluted).toBe(undefined);
});
