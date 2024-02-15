'use strict';

var valToNumber = require('../../../src/functions/valToNumber');

test('valToNumber makes numbers, strings and arrays of strings and numbers to be numbers', function () {
  expect(valToNumber(2)).toBe(2);
  expect(valToNumber('2')).toBe(2);
  expect(valToNumber([2, '45', 44])).toEqual([2, 45, 44]);
});
