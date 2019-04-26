import mergeDeep from '../mergeDeep';

describe('mergeDeep', () => {
  describe('with primitive values', () => {
    test('with integers should override previous value', () => {
      const actual = mergeDeep({ age: 23 }, { age: 24 });

      expect(actual).toEqual({ age: 24 });
    });

    test('with strings should override previous value', () => {
      const actual = mergeDeep({ name: 'John' }, { name: 'Jane' });

      expect(actual).toEqual({ name: 'Jane' });
    });
  });

  describe('with arrays', () => {
    test('should concatenate values', () => {
      const actual = mergeDeep(
        {
          children: ['John'],
        },
        {
          children: ['Jane'],
        }
      );

      expect(actual).toEqual({
        children: ['John', 'Jane'],
      });
    });

    test('should remove duplicates', () => {
      const actual = mergeDeep(
        {
          children: ['John'],
        },
        {
          children: ['John', 'Jane'],
        }
      );

      expect(actual).toEqual({
        children: ['John', 'Jane'],
      });
    });
  });

  describe('with objects', () => {
    test('merges properties', () => {
      const actual = mergeDeep(
        {
          age: 23,
        },
        {
          name: 'John',
        },
        {
          children: [1, 2, 3],
        }
      );

      expect(actual).toEqual({
        age: 23,
        name: 'John',
        children: [1, 2, 3],
      });
    });

    test('with nested objects should merge deeply', () => {
      const actual = mergeDeep(
        {
          child: {
            child2: {
              child3: 3,
            },
          },
        },
        {
          child: {
            child2: {
              child3: {
                child4: 4,
              },
            },
          },
        }
      );

      expect(actual).toEqual({
        child: {
          child2: {
            child3: {
              child4: 4,
            },
          },
        },
      });
    });
  });

  describe('with different types', () => {
    test('overrides object with previous boolean value', () => {
      const actual = mergeDeep({ routing: {} }, { routing: true });

      expect(actual).toEqual({ routing: true });
    });

    test('overrides array with previous string value', () => {
      const actual = mergeDeep({ facets: ['brand'] }, { facets: 'brand' });

      expect(actual).toEqual({ facets: 'brand' });
    });
  });
});
