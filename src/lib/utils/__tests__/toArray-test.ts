import toArray from '../toArray';

describe('toArray', () => {
  test('cast to array if necessary', () => {
    expect(toArray).toBeInstanceOf(Function);
    expect(toArray('a')).toEqual(['a']);
    expect(toArray(['a'])).toEqual(['a']);
    // Checks that `toArray` acts like a function.
    expect(toArray.toString).toBe(Function.prototype.toString);
  });
});
