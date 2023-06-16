'use strict';

var orderBy = require('../../../src/functions/orderBy');

var objects = [
  { a: 'x', b: 3 },
  { a: 'y', b: 4 },
  { a: 'x', b: 1 },
  { a: 'y', b: 2 },
];

it('should sort by a single property by a specified order', function () {
  expect(orderBy(objects, ['a'], ['desc'])).toEqual([
    objects[1],
    objects[3],
    objects[0],
    objects[2],
  ]);
});

it('should sort by multiple properties by specified orders', function () {
  expect(orderBy(objects, ['a', 'b'], ['desc', 'asc'])).toEqual([
    objects[3],
    objects[1],
    objects[2],
    objects[0],
  ]);
});

it('should sort by a property in ascending order when its order is not specified', function () {
  expect(orderBy(objects, ['a', 'b'])).toEqual([
    objects[2],
    objects[0],
    objects[3],
    objects[1],
  ]);

  expect(orderBy(objects, ['a', 'b'], ['desc'])).toEqual([
    objects[3],
    objects[1],
    objects[2],
    objects[0],
  ]);

  [null, undefined, false, 0, NaN, ''].forEach(function (order) {
    expect(orderBy(objects, ['a', 'b'], ['desc', order])).toEqual([
      objects[3],
      objects[1],
      objects[2],
      objects[0],
    ]);
  });
});

it('should return an empty array when collections is no array', function () {
  expect(orderBy(undefined)).toEqual([]);
  expect(orderBy(false)).toEqual([]);
  expect(orderBy({})).toEqual([]);
  expect(orderBy({}, [], [])).toEqual([]);
});
