import { Component } from 'react';
import * as utils from '../utils';

describe('utils', () => {
  describe('getDisplayName', () => {
    it('gets the right displayName from classes', () => {
      class SuperComponent extends Component {
        render() {
          return null;
        }
      }

      expect(utils.getDisplayName(SuperComponent)).toBe('SuperComponent');
    });

    // this works because babel turns arrows functions to named function expressions
    it('gets the right displayName from stateless components', () => {
      const SuperComponent = () => null; // => var SuperComponent = function SuperComponent() {}
      expect(utils.getDisplayName(SuperComponent)).toBe('SuperComponent');
    });

    it('sets a default displayName when not able to find one', () => {
      expect(utils.getDisplayName(() => null)).toBe('UnknownComponent');
    });
  });

  describe('defer', () => {
    it('calling a function asynchronously, should be done as soon as possible.', () => {
      let count = 0;

      utils.defer(() => {
        count = 1;
      });

      return Promise.resolve().then(() => {
        expect(count).toEqual(1);
      });
    });
  });

  describe('remove empty key', () => {
    it('empty key should be removed', () => {
      const state = {
        query: '',
        page: 2,
        sortBy: 'mostPopular',
        range: {
          price: {
            min: 20,
            max: 3000,
          },
        },
        refinementList: {},
        indices: {
          index1: {
            configure: {
              hitsPerPage: 3,
              refinementList: {},
            },
          },
          index2: {
            configure: {
              hitsPerPage: 10,
            },
            refinementList: {
              fruits: ['lemon', 'orange'],
            },
          },
        },
      };

      const newState = utils.removeEmptyKey(state);

      expect(newState).toEqual({
        query: '',
        page: 2,
        sortBy: 'mostPopular',
        range: {
          price: {
            min: 20,
            max: 3000,
          },
        },
        indices: {
          index1: {
            configure: {
              hitsPerPage: 3,
            },
          },
          index2: {
            configure: {
              hitsPerPage: 10,
            },
            refinementList: {
              fruits: ['lemon', 'orange'],
            },
          },
        },
      });
    });

    it('does not do anything on empty root', () => {
      expect(utils.removeEmptyKey({})).toEqual({});
    });

    it('does empty out objects', () => {
      expect(utils.removeEmptyKey({ test: {} })).toEqual({});
      expect(utils.removeEmptyKey({ test: { dog: {} } })).toEqual({
        // this one stays, because we have no multipass algorithm
        test: {},
      });
    });

    it('does not empty out arrays', () => {
      expect(utils.removeEmptyKey({ test: [] })).toEqual({ test: [] });
      expect(utils.removeEmptyKey({ test: { dog: [] } })).toEqual({
        test: { dog: [] },
      });
    });
  });

  describe('addAbsolutePositions', () => {
    const allHits = [
      { objectID: '1' },
      { objectID: '2' },
      { objectID: '3' },
      { objectID: '4' },
      { objectID: '5' },
      { objectID: '6' },
    ];
    const hitsPerPage = 2;
    it('should add __positions 1 and 2 on page 0', () => {
      const hits = allHits.slice(0, 2);
      const page = 0;
      expect(utils.addAbsolutePositions(hits, hitsPerPage, page)).toEqual([
        { objectID: '1', __position: 1 },
        { objectID: '2', __position: 2 },
      ]);
    });
    it('should add __positions 5 and 6 on page 2', () => {
      const hits = allHits.slice(4, 6);
      const page = 2;
      expect(utils.addAbsolutePositions(hits, hitsPerPage, page)).toEqual([
        { objectID: '5', __position: 5 },
        { objectID: '6', __position: 6 },
      ]);
    });
  });

  describe('addQueryID', () => {
    const hits = [{ objectID: '1' }, { objectID: '2' }];
    it('should passed __queryID to hits', () => {
      expect(utils.addQueryID(hits, 'theQueryID')).toEqual([
        { objectID: '1', __queryID: 'theQueryID' },
        { objectID: '2', __queryID: 'theQueryID' },
      ]);
    });
  });

  describe('getPropertyByPath', () => {
    it('returns undefined on non-object root', () => {
      expect(utils.getPropertyByPath(false, 'fake')).toBeUndefined();
      expect(utils.getPropertyByPath(undefined, 'fake')).toBeUndefined();
      expect(utils.getPropertyByPath(null, 'fake.nested')).toBeUndefined();
    });

    it('returns path if exists', () => {
      expect(utils.getPropertyByPath({ dog: true }, 'dog')).toBe(true);
      expect(
        utils.getPropertyByPath(
          { i: { like: { properties: false } } },
          'i.like.properties'
        )
      ).toBe(false);
      expect(
        utils.getPropertyByPath({ true: { nested: 'ok' } }, 'true.nested')
      ).toBe('ok');
    });

    it('accepts a pre-split path as array', () => {
      expect(utils.getPropertyByPath({ dog: true }, ['dog'])).toBe(true);
      expect(
        utils.getPropertyByPath({ i: { like: { properties: false } } }, [
          'i',
          'like',
          'properties',
        ])
      ).toBe(false);
      expect(
        utils.getPropertyByPath({ true: { nested: 'ok' } }, ['true', 'nested'])
      ).toBe('ok');
    });

    it('does not split a pre-split path as array', () => {
      expect(utils.getPropertyByPath({ dog: true }, ['dog'])).toBe(true);
      expect(
        utils.getPropertyByPath({ i: { like: { properties: false } } }, [
          'i',
          'like.properties',
        ])
      ).toBeUndefined();
      expect(
        utils.getPropertyByPath({ true: { nested: 'ok' } }, ['true.nested'])
      ).toBeUndefined();
    });

    it('returns undefined if does not exist', () => {
      expect(
        utils.getPropertyByPath(
          { name: { known: { value: '' } } },
          'name.unkown'
        )
      ).toBeUndefined();

      expect(utils.getPropertyByPath({ name: false }, 'name.unkown')).toBe(
        undefined
      );
    });

    it('returns indexed path if exists', () => {
      expect(
        utils.getPropertyByPath({ array: ['a', 'b', 'c'] }, 'array.2')
      ).toBe('c');
      expect(
        utils.getPropertyByPath(
          { array: [{ letter: 'a' }, { letter: 'b' }, { letter: 'c' }] },
          'array.2.letter'
        )
      ).toBe('c');

      expect(
        utils.getPropertyByPath({ array: ['a', 'b', 'c'] }, 'array[2]')
      ).toBe('c');
      expect(
        utils.getPropertyByPath(
          { array: [{ letter: 'a' }, { letter: 'b' }, { letter: 'c' }] },
          'array[2].letter'
        )
      ).toBe('c');
    });

    it('returns undefined if indexed path does not exist', () => {
      expect(
        utils.getPropertyByPath({ array: ['a', 'b', 'c'] }, 'array.4')
      ).toBeUndefined();
      expect(
        utils.getPropertyByPath(
          { array: [{ letter: 'a' }, { letter: 'b' }, { letter: 'c' }] },
          'array.5.letter'
        )
      ).toBeUndefined();

      expect(
        utils.getPropertyByPath({ array: ['a', 'b', 'c'] }, 'array[4]')
      ).toBeUndefined();
      expect(
        utils.getPropertyByPath(
          { array: [{ letter: 'a' }, { letter: 'b' }, { letter: 'c' }] },
          'array[5].letter'
        )
      ).toBeUndefined();
    });
  });

  describe('find', () => {
    test('returns the first match based on the comparator', () => {
      expect(
        utils.find([1], function() {
          return true;
        })
      ).toBe(1);
      expect(
        utils.find([1, 2], function() {
          return true;
        })
      ).toBe(1);

      expect(
        utils.find([{ nice: false }, { nice: true }], function(el) {
          return el.nice;
        })
      ).toEqual({ nice: true });
    });

    test('returns undefined in non-found cases', () => {
      expect(
        utils.find([], function() {
          return false;
        })
      ).toBeUndefined();
      expect(
        utils.find(undefined, function() {
          return false;
        })
      ).toBeUndefined();

      expect(function() {
        utils.find([1, 2, 3], undefined);
      }).toThrow();
    });
  });
});
