/* eslint-env jest, jasmine */

jest.mock('algoliasearch-helper-provider/src/connect', () =>
  require.requireActual(
    '../__mocks__/algoliasearch-helper-provider/src/connect'
  )
);

import {AlgoliaSearchHelper} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import createHits from './createHits';
jest.unmock('./createHits');

describe('createHits', () => {
  it('provides the current hits to the component', () => {
    const hits = {};
    createHits(props => {
      expect(Object.keys(props).length).toBe(2);
      expect(props.hits).toBe(hits);
      expect(props.helper instanceof AlgoliaSearchHelper).toBe(true);
      return null;
    })({searchResults: {hits}});
  });
});
