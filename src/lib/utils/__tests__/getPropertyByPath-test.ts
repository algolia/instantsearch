import getPropertyByPath from '../getPropertyByPath';

describe('getPropertyByPath', () => {
  describe('path as string', () => {
    it('gets an existing property', () => {
      expect(getPropertyByPath({ dog: true }, 'dog')).toBe(true);
    });

    it('gets an existing, deep property', () => {
      expect(getPropertyByPath({ dog: { cat: true } }, 'dog.cat')).toBe(true);
    });

    it('gets an existing, very deep property', () => {
      expect(
        getPropertyByPath(
          { dog: { cat: { algolia: { cool: true } } } },
          'dog.cat.algolia.cool'
        )
      ).toBe(true);
    });

    it('gets an existing, very deep array property', () => {
      expect(
        getPropertyByPath(
          { dog: { cat: ['test', { algolia: { cool: true } }] } },
          'dog.cat.1.algolia.cool'
        )
      ).toBe(true);
    });

    it('gets undefined for a non-existing, very deep property', () => {
      expect(
        getPropertyByPath(
          { dog: { cat: { algolia: { cool: true } } } },
          'dog.cat.algolia.nonexistent'
        )
      ).toBe(undefined);
    });

    it('gets undefined for a non-existing, very deep property (midway)', () => {
      expect(
        getPropertyByPath({ dog: { cat: true } }, 'dog.cat.algolia.nonexistent')
      ).toBe(undefined);
    });

    it('gets undefined for a non-existing property', () => {
      expect(getPropertyByPath({ dog: true }, 'algolia')).toBe(undefined);
    });

    it('gets undefined for an undefined object', () => {
      expect(getPropertyByPath(undefined, 'algolia')).toBe(undefined);
    });

    it('should stop traversing when property is not an object', () => {
      const object = {
        nested: {
          names: ['name'],
        },
      };

      expect(getPropertyByPath(object, 'nested.name')).toBe(undefined);
    });
  });

  describe('path as array', () => {
    it('gets an existing property', () => {
      expect(getPropertyByPath({ dog: true }, ['dog'])).toBe(true);
    });

    it('gets an existing, deep property', () => {
      expect(getPropertyByPath({ dog: { cat: true } }, ['dog', 'cat'])).toBe(
        true
      );
    });

    it('gets an existing, very deep property', () => {
      expect(
        getPropertyByPath({ dog: { cat: { algolia: { cool: true } } } }, [
          'dog',
          'cat',
          'algolia',
          'cool',
        ])
      ).toBe(true);
    });

    it('gets an existing, very deep array property', () => {
      expect(
        getPropertyByPath(
          { dog: { cat: ['test', { algolia: { cool: true } }] } },
          ['dog', 'cat', '1', 'algolia', 'cool']
        )
      ).toBe(true);
    });

    it('gets undefined for a non-existing, very deep property', () => {
      expect(
        getPropertyByPath({ dog: { cat: { algolia: { cool: true } } } }, [
          'dog',
          'cat',
          'algolia',
          'nonexistent',
        ])
      ).toBe(undefined);
    });

    it('gets undefined for a non-existing, very deep property (midway)', () => {
      expect(
        getPropertyByPath({ dog: { cat: true } }, [
          'dog',
          'cat',
          'algolia',
          'nonexistent',
        ])
      ).toBe(undefined);
    });

    it('gets undefined for a non-existing property', () => {
      expect(getPropertyByPath({ dog: true }, ['algolia'])).toBe(undefined);
    });

    it('gets undefined for an undefined object', () => {
      expect(getPropertyByPath(undefined, ['algolia'])).toBe(undefined);
    });

    it('should stop traversing when property is not an object', () => {
      const object = {
        nested: {
          names: ['name'],
        },
      };

      expect(getPropertyByPath(object, ['nested', 'name'])).toBe(undefined);
    });

    it('gets a path with . in the parts', () => {
      expect(
        getPropertyByPath({ 'this.that': { there: true } }, [
          'this.that',
          'there',
        ])
      ).toBe(true);
    });
  });
});
