/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import {
  isSpecialClick,
  capitalize,
  assertFacetDefined,
} from './utils';
jest.unmock('./utils');
import {SearchParameters, SearchResults} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

describe('utils', () => {
  describe('isSpecialClick', () => {
    it('returns true if a modifier key is pressed', () => {
      expect(isSpecialClick({altKey: true})).toBe(true);
      expect(isSpecialClick({ctrlKey: true})).toBe(true);
      expect(isSpecialClick({metaKey: true})).toBe(true);
      expect(isSpecialClick({shiftKey: true})).toBe(true);
    });

    it('returns true if it\'s a middle click', () => {
      expect(isSpecialClick({button: 1})).toBe(true);
    });

    it('returns false otherwise', () => {
      expect(isSpecialClick({})).toBe(false);
    });
  });

  describe('capitalize', () => {
    it('capitalizes a string', () => {
      expect(capitalize('oooh spooky')).toBe('Oooh spooky');
    });

    it('works with empty strings', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('assertFacetDefined', () => {
    it('warns when a requested facet wasn\'t returned from the API', () => {
      const warn = console.warn;
      console.warn = jest.fn();
      const searchParameters = new SearchParameters({
        disjunctiveFacets: ['facet'],
      });
      const searchResults = new SearchResults(searchParameters, {
        results: [{
          nbHits: 100,
          facets: {},
        }],
      });
      assertFacetDefined(searchParameters, searchResults, 'facet');
      expect(console.warn.mock.calls.length).toBe(1);
      expect(console.warn.mock.calls[0][0]).toBe(
        'A component requested values for facet "facet", but no facet values ' +
        'were retrieved from the API. This means that you should add the ' +
        'attribute "facet" to the list of attributes for faceting in your ' +
        'index settings.'
      );
      console.warn = warn;
    });
  });
});
