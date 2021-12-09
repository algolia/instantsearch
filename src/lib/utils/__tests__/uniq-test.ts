import uniq from '../uniq';

describe('uniq', () => {
  test('with empty array', () => {
    const actual = uniq([]);

    expect(actual).toEqual([]);
  });

  test('with duplicate items in array', () => {
    const actual = uniq([1, 1, 2, 3, 4, 5, 6, 5, 5]);

    expect(actual).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('with already unique items in array', () => {
    const actual = uniq([1, 2, 3, 4, 5, 6]);

    expect(actual).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
