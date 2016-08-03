/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import connectSearchBox from './connectSearchBox';
jest.unmock('./connectSearchBox');

const {mapStateToProps, refine} = connectSearchBox;

describe('connectSearchBox', () => {
  it('provides the correct props to the component', () => {
    const props = mapStateToProps({searchParameters: {query: 'foo'}});
    expect(props).toEqual({query: 'foo'});
  });

  it('refines the query parameter', () => {
    const state = new SearchParameters();
    const refinedState = refine(state, {}, 'bar');
    expect(refinedState.query).toBe('bar');
  });
});
