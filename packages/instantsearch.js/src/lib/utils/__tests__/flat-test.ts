import { flat } from '../flat';

describe('flat', () => {
  test('flattens a 2D array into a 1D array', () => {
    const input = [
      ['a', 'b'],
      ['c', 'd'],
      ['e', 'f'],
    ];
    const expectedOutput = ['a', 'b', 'c', 'd', 'e', 'f'];

    const actualOutput = flat(input);

    expect(actualOutput).toEqual(expectedOutput);
  });

  test('returns an empty array when given an empty array', () => {
    const input: never[][] = [];
    const expectedOutput: never[] = [];

    const actualOutput = flat(input);

    expect(actualOutput).toEqual(expectedOutput);
  });

  test('handles arrays with empty sub-arrays', () => {
    const input = [['a', 'b'], [], ['c'], [], ['d', 'e']];
    const expectedOutput = ['a', 'b', 'c', 'd', 'e'];

    const actualOutput = flat(input);

    expect(actualOutput).toEqual(expectedOutput);
  });
});
