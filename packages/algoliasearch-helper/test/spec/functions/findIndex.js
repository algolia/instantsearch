'use strict';

var findIndex = require('../../../src/functions/findIndex');

test('findIndex returns the first match based on the comparator', function() {
  expect(findIndex([1], function() { return true; })).toBe(0);
  expect(findIndex([1, 2], function() { return true; })).toBe(0);

  expect(
    findIndex([{nice: false}, {nice: true}], function(el) {
      return el.nice;
    })
  ).toBe(1);
});

test('findIndex returns -1 in non-found cases', function() {
  expect(findIndex([], function() { return false; })).toBe(-1);
  expect(findIndex(undefined, function() { return false; })).toBe(-1);

  expect(function() {
    findIndex([1, 2, 3], undefined);
  }).toThrow();
});
