/* eslint-env mocha */

import expect from 'expect';

import generateRanges from '../generate-ranges';

describe('generateRanges()', () => {
  it('should generate ranges', () => {
    var stats = {
      min: 1.99,
      max: 4999.98,
      avg: 243.349,
      sum: 2433490.0
    };
    var expected = [
      {to: 1},
      {from: 1, to: 80},
      {from: 80, to: 160},
      {from: 160, to: 240},
      {from: 240, to: 1820},
      {from: 1820, to: 3400},
      {from: 3400, to: 4980},
      {from: 4980}
    ];
    expect(generateRanges(stats)).toEqual(expected);
  });

  it('should generate small ranges', () => {
    var stats = {min: 20, max: 50, avg: 35, sum: 70};
    var expected = [
      {to: 20},
      {from: 20, to: 25},
      {from: 25, to: 30},
      {from: 30, to: 35},
      {from: 35, to: 40},
      {from: 40, to: 45},
      {from: 45}
    ];
    expect(generateRanges(stats)).toEqual(expected);
  });

  it.only('should not do an infinite loop', () => {
    var stats = {min: 99.99, max: 149.99, avg: 124.99, sum: 249.98};
    generateRanges(stats);
  });

  it('should not generate ranges', () => {
    var stats = {min: 20, max: 20, avg: 20, sum: 20};
    expect(generateRanges(stats)).toEqual([]);
  });
});
