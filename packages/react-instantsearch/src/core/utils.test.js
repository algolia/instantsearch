/* eslint-disable no-console */

import { Component } from 'react';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import * as utils from './utils';

describe('utils', () => {
  describe('isSpecialClick', () => {
    it('returns true if a modifier key is pressed', () => {
      expect(utils.isSpecialClick({ altKey: true })).toBe(true);
      expect(utils.isSpecialClick({ ctrlKey: true })).toBe(true);
      expect(utils.isSpecialClick({ metaKey: true })).toBe(true);
      expect(utils.isSpecialClick({ shiftKey: true })).toBe(true);
    });

    it("returns true if it's a middle click", () => {
      expect(utils.isSpecialClick({ button: 1 })).toBe(true);
    });

    it('returns false otherwise', () => {
      expect(utils.isSpecialClick({})).toBe(false);
    });
  });

  describe('capitalize', () => {
    it('capitalizes a string', () => {
      expect(utils.capitalize('oooh spooky')).toBe('Oooh spooky');
    });

    it('works with empty strings', () => {
      expect(utils.capitalize('')).toBe('');
    });
  });

  describe('assertFacetDefined', () => {
    it("warns when a requested facet wasn't returned from the API", () => {
      const warn = console.warn;
      console.warn = jest.fn();
      const searchParameters = new SearchParameters({
        disjunctiveFacets: ['facet'],
      });
      const searchResults = new SearchResults(searchParameters, [
        {
          nbHits: 100,
          facets: {},
        },
      ]);
      utils.assertFacetDefined(searchParameters, searchResults, 'facet');
      expect(console.warn.mock.calls).toHaveLength(1);
      expect(console.warn.mock.calls[0][0]).toBe(
        'A component requested values for facet "facet", but no facet values ' +
          'were retrieved from the API. This means that you should add the ' +
          'attribute "facet" to the list of attributes for faceting in your ' +
          'index settings.'
      );
      console.warn = warn;
    });
  });

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
