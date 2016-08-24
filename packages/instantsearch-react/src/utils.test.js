/* eslint-env jest, jasmine */
/* eslint-disable no-console */
import React, {Component} from 'react';

import {
  isSpecialClick,
  capitalize,
  assertFacetDefined,
  getDisplayName,
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

  describe('getDisplayName', () => {
    it('gets the right displayName from classes', () => {
      class SuperComponent extends Component {
        render() {
          return null;
        }
      }

      expect(getDisplayName(SuperComponent)).toBe('SuperComponent');
    });

    // this works because babel turns arrows functions to named function expressions
    it('gets the right displayName from stateless components', () => {
      const SuperComponent = () => null; // => var SuperComponent = function SuperComponent() {}
      expect(getDisplayName(SuperComponent)).toBe('SuperComponent');
    });

    it('gets the right displayName from React.createClass', () => {
      const SuperComponent = React.createClass({
        render() { return null; },
        displayName: 'SuperComponent',
      });

      expect(getDisplayName(SuperComponent)).toBe('SuperComponent');
    });

    it('sets a default displayName when not able to find one', () => {
      const SuperComponent = React.createClass({
        render() { return null; },
        displayName: undefined, // latest babel
      });

      expect(getDisplayName(SuperComponent)).toBe('UnknownComponent');
    });
  });
});
