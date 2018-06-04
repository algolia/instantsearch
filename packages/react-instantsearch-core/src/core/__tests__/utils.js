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
});
