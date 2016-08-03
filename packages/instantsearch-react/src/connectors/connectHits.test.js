/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import connectHits from './connectHits';
jest.unmock('./connectHits');

const {configure, mapStateToProps} = connectHits;

describe('connectHits', () => {
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
