import { cx } from '../cx';

describe('cx', () => {
  test('concatenates an array of class names', () => {
    expect(cx(['foo', 'bar', 'baz'])).toBe('foo bar baz');
  });

  test('eliminates falsy values', () => {
    expect(cx(['foo', 'bar', 'baz', undefined, false, null])).toBe(
      'foo bar baz'
    );
  });

  test('stringifies numbers', () => {
    expect(cx([1])).toBe('1');
  });
});
