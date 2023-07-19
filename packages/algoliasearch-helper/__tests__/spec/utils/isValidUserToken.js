'use strict';

var isValidUserToken = require('../../../src/utils/isValidUserToken');

test('returns true with valid user token', function () {
  expect(isValidUserToken('abc')).toEqual(true);
  expect(isValidUserToken('abc-def')).toEqual(true);
  expect(isValidUserToken('abc-def_ghi012')).toEqual(true);
});

test('returns false with invalid user token', function () {
  expect(isValidUserToken(null)).toEqual(false);
  expect(isValidUserToken('')).toEqual(false);
  expect(isValidUserToken('my token')).toEqual(false);
});
