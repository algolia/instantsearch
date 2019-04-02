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
});
