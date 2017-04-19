/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import createHitsPerPage from './createHitsPerPage';
jest.unmock('./createHitsPerPage');

const {configure, mapStateToProps, refine} = createHitsPerPage;

describe('createHitsPerPage', () => {
  it('defaults the configuration hitsPerPage to its defaultValue prop', () => {
    const state = new SearchParameters();
    const configuredState1 = configure(state, {defaultValue: 666});
    expect(configuredState1.hitsPerPage).toBe(666);

    const state2 = state.setQueryParameter('hitsPerPage', 777);
    const configuredState2 = configure(state2, {defaultValue: 666});
    expect(configuredState2.hitsPerPage).toBe(777);
  });

  it('provides the correct props to the component', () => {
    const props = mapStateToProps({searchParameters: {hitsPerPage: 666}});
    expect(props).toEqual({hitsPerPage: 666});
  });

  it('refines the hitsPerPage parameter', () => {
    const state = new SearchParameters();
    const refinedState = refine(state, {}, 666);
    expect(refinedState.hitsPerPage).toBe(666);
  });
});
