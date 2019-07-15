import findIndex from '../findIndex';

describe('findIndex', () => {
  describe('with polyfill', () => {
    test('with empty array', () => {
      const items = [];
      const actual = findIndex(items, item => item === 'hello');

      expect(actual).toEqual(-1);
    });

    test('with unknown item in array', () => {
      const items = ['hey'];
      const actual = findIndex(items, item => item === 'hello');

      expect(actual).toEqual(-1);
    });

    test('with an array of strings', () => {
      const items = ['hello', 'goodbye'];
      const actual = findIndex(items, item => item === 'hello');

      expect(actual).toEqual(0);
    });

    test('with an array of objects', () => {
      const items = [{ name: 'John' }, { name: 'Jane' }];
      const actual = findIndex(items, item => item.name === 'John');

      expect(actual).toEqual(0);
    });
  });
});
