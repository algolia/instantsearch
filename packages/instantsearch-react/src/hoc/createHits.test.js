/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import createHits from './createHits';
jest.unmock('./createHits');

const {configure, mapStateToProps} = createHits;

describe('createHits', () => {
  it('sets the configuration hitsPerPage to its hitsPerPage prop', () => {
    const state = new SearchParameters();
    const configuredState = configure(state, {hitsPerPage: 666});
    expect(configuredState.hitsPerPage).toBe(666);
  });

  it('provides the current hits to the component', () => {
    const hits = {};
    const props = mapStateToProps({searchResults: {hits}});
    expect(props.hits).toBe(hits);
  });
});
