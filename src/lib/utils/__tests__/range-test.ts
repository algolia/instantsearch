import range from '../range';

describe('range', () => {
  test('with end', () => {
    expect(range({ end: 4 })).toEqual([0, 1, 2, 3]);
  });

  test('with start and end', () => {
    expect(range({ start: 1, end: 5 })).toEqual([1, 2, 3, 4]);
  });

  test('with end and step', () => {
    expect(range({ end: 20, step: 5 })).toEqual([0, 5, 10, 15]);
  });

  test('rounds decimal array lengths', () => {
    // (5000 - 1) / 500 = 9.998 so we want the array length to be rounded to 10.
    expect(range({ start: 1, end: 5000, step: 500 })).toHaveLength(10);
    expect(range({ start: 1, end: 5000, step: 500 })).toEqual([
      500,
      1000,
      1500,
      2000,
      2500,
      3000,
      3500,
      4000,
      4500,
      5000,
    ]);
  });
});
