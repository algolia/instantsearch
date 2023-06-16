'use strict';

var find = require('../../../src/functions/find');

test('find returns the first match based on the comparator', function() {
  expect(find([1], function() { return true; })).toBe(1);
  expect(find([1, 2], function() { return true; })).toBe(1);

  expect(
    find([{nice: false}, {nice: true}], function(el) {
      return el.nice;
    })
  ).toEqual({nice: true});
});

test('find returns undefined in non-found cases', function() {
  expect(find([], function() { return false; })).toBeUndefined();
  expect(find(undefined, function() { return false; })).toBeUndefined();

  expect(function() {
    find([1, 2, 3], undefined);
  }).toThrow();
});
