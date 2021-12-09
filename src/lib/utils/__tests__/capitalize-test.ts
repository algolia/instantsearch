import capitalize from '../capitalize';

describe('capitalize', () => {
  it('should capitalize the first character only', () => {
    expect(capitalize('hello')).toBe('Hello');
  });
});
