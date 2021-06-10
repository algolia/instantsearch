import isDomElement from '../isDomElement';

describe('isDomElement', () => {
  it('should return true for dom element', () => {
    expect(isDomElement(document.body)).toBe(true);
  });

  it('should return false for dom element', () => {
    // @ts-expect-error
    expect(isDomElement()).toBe(false);
    expect(isDomElement(undefined)).toBe(false);
    expect(isDomElement(null)).toBe(false);
    expect(isDomElement([])).toBe(false);
    expect(isDomElement({})).toBe(false);
    expect(isDomElement('')).toBe(false);
    expect(isDomElement(42)).toBe(false);
  });
});
