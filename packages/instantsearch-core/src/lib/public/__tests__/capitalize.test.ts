import { capitalize } from '..';

describe('capitalize', () => {
  it('should capitalize the first character only', () => {
    expect(capitalize('hello')).toBe('Hello');
  });
});
