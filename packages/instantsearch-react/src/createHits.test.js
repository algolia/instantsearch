/* eslint-env jest, jasmine */

import React from 'react';
import {shallow} from 'enzyme';

import {AlgoliaSearchHelper} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import createHits from './createHits';
jest.unmock('./createHits');

describe('createHits', () => {
  it('provides the current hits to the component', () => {
    const hits = {};
    const Hits = createHits(props => {
      expect(Object.keys(props).length).toBe(2);
      expect(props.hits).toBe(hits);
      expect(props.helper instanceof AlgoliaSearchHelper).toBe(true);
      return null;
    });
    shallow(<Hits __state={{searchResults: {hits}}} />);
  });
});
