import find from '../find';

describe('find', () => {
  describe('with native array method', () => {
    test('with empty array', () => {
      const items = [];
      const actual = find(items, item => item === 'hello');

      expect(actual).toEqual(undefined);
    });

    test('with unknown item in array', () => {
      const items = ['hey'];
      const actual = find(items, item => item === 'hello');

      expect(actual).toEqual(undefined);
    });

    test('with an array of strings', () => {
      const items = ['hello', 'goodbye'];
      const actual = find(items, item => item === 'hello');

      expect(actual).toEqual('hello');
    });

    test('with an array of objects', () => {
      const items = [{ name: 'John' }, { name: 'Jane' }];
      const actual = find(items, item => item.name === 'John');

      expect(actual).toEqual(items[0]);
    });
  });

  describe('with polyfill', () => {
    const originalArrayFind = Array.prototype.find;

    beforeAll(() => {
      // @ts-expect-error
      delete Array.prototype.find;
    });

    afterAll(() => {
      // eslint-disable-next-line no-extend-native
      Array.prototype.find = originalArrayFind;
    });

    test('with empty array', () => {
      const items = [];
      const actual = find(items, item => item === 'hello');

      expect(actual).toEqual(undefined);
    });

    test('with unknown item in array', () => {
      const items = ['hey'];
      const actual = find(items, item => item === 'hello');

      expect(actual).toEqual(undefined);
    });

    test('with an array of strings', () => {
      const items = ['hello', 'goodbye'];
      const actual = find(items, item => item === 'hello');

      expect(actual).toEqual('hello');
    });

    test('with an array of objects', () => {
      const items = [{ name: 'John' }, { name: 'Jane' }];
      const actual = find(items, item => item.name === 'John');

      expect(actual).toEqual(items[0]);
    });
  });
});
