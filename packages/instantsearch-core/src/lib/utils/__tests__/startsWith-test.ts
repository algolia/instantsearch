import { startsWith } from '../startsWith';

describe('startsWith', () => {
  test('returns true when the string starts with the prefix', () => {
    expect(startsWith('hello world', 'hello')).toBe(true);
    expect(startsWith('instantsearch', 'instant')).toBe(true);
  });

  test('returns false when the string does not start with the prefix', () => {
    expect(startsWith('hello world', 'world')).toBe(false);
    expect(startsWith('instantsearch', 'search')).toBe(false);
  });

  test('returns false when the prefix is longer than the string', () => {
    expect(startsWith('hi', 'hello')).toBe(false);
    expect(startsWith('', 'a')).toBe(false);
  });

  test('returns true when both the string and prefix are empty', () => {
    expect(startsWith('', '')).toBe(true);
  });
});
