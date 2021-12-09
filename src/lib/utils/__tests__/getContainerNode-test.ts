import getContainerNode from '../getContainerNode';

describe('getContainerNode', () => {
  it('should be able to get a node from a node', () => {
    const d = document.body;
    expect(getContainerNode(d)).toEqual(d);
  });

  it('should be able to retrieve an element from a css selector', () => {
    const d = document.createElement('div');
    d.className = 'test';
    document.body.appendChild(d);

    expect(getContainerNode('.test')).toEqual(d);
  });

  it('should throw for other types of object', () => {
    // @ts-expect-error
    expect(() => getContainerNode(undefined)).toThrow(Error);
    // @ts-expect-error
    expect(() => getContainerNode(null)).toThrow(Error);
    // @ts-expect-error
    expect(() => getContainerNode({})).toThrow(Error);
    // @ts-expect-error
    expect(() => getContainerNode(42)).toThrow(Error);
    // @ts-expect-error
    expect(() => getContainerNode([])).toThrow(Error);
  });

  it('should throw when not a correct selector', () => {
    expect(() => getContainerNode('.not-in-dom')).toThrow(Error);
  });
});
