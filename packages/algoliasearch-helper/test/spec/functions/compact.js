'use strict';

var compact = require('../../../src/functions/compact');

test('compact removes falsy values from arrays', function () {
  expect(compact([2])).toEqual([2]);
  expect(compact([2, false, null, undefined, '', 0])).toEqual([2]);
  expect(compact([2, '45', 44])).toEqual([2, '45', 44]);
});

test('returns an array for nullish values', function () {
  expect(compact(null)).toEqual([]);
  expect(compact(undefined)).toEqual([]);
});
