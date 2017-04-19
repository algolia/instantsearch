/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import createPagination from './createPagination';
jest.unmock('./createPagination');

const {mapStateToProps, refine} = createPagination;

describe('createPagination', () => {
  it('provides the correct props to the component', () => {
    const props1 = mapStateToProps({
      searchParameters: {page: 666},
      searchResults: null,
    });
    expect(props1).toEqual({page: 666, nbPages: null});

    const props2 = mapStateToProps({
      searchParameters: {page: 666},
      searchResults: {nbPages: 999},
    });
    expect(props2).toEqual({page: 666, nbPages: 999});
  });

  it('refines the page parameter', () => {
    const state = new SearchParameters();
    const refinedState = refine(state, {}, 667);
    expect(refinedState.page).toBe(667);
  });
});
