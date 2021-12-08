import capitalize from '../capitalize.js';

describe('capitalize', () => {
  it('should capitalize the first character only', () => {
    expect(capitalize('hello')).toBe('Hello');
  });
});
