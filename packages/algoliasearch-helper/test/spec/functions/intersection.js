'use strict';

var intersection = require('../../../src/functions/intersection');

test('it should find intersection between two array', function() {
  var actual = intersection([2, 1], [2]);
  expect(actual).toStrictEqual([2]);
});

test('it should keep the order of the first array', function() {
  expect(intersection([0, 1, 2, 3, 4], [4, 0, 3])).toStrictEqual([0, 3, 4]);
});

test('it should not produce duplicate primitive values', function() {
  expect(intersection([0, 0, 1, 2], [0, 2])).toStrictEqual([0, 2]);
  expect(intersection(['0', '0', '1', '2'], ['0', '2'])).toStrictEqual([
    '0',
    '2'
  ]);
});
