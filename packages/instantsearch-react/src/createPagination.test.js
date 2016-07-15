/* eslint-env jest, jasmine */

jest.mock('algoliasearch-helper-provider/src/connect', () =>
  require.requireActual(
    '../__mocks__/algoliasearch-helper-provider/src/connect'
  )
);

import {AlgoliaSearchHelper} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import createPagination from './createPagination';
jest.unmock('./createPagination');

describe('createPagination', () => {
  it('provides the correct props to the component', () => {
    createPagination(props => {
      expect(Object.keys(props).length).toBe(4);
      expect(props.page).toBe(666);
      expect(props.nbPages).toBe(null);
      expect(typeof props.refine).toBe('function');
      expect(props.helper).toEqual(jasmine.any(AlgoliaSearchHelper));
      return null;
    })({
      searchParameters: {page: 666},
      searchResults: null,
    });

    createPagination(props => {
      expect(Object.keys(props).length).toBe(4);
      expect(props.page).toBe(666);
      expect(props.nbPages).toBe(999);
      expect(typeof props.refine).toBe('function');
      expect(props.helper).toEqual(jasmine.any(AlgoliaSearchHelper));
      return null;
    })({
      searchParameters: {page: 666},
      searchResults: {nbPages: 999},
    });
  });

  it('refines the page parameter', () => {
    const Dummy = () => null;
    const wrapper = createPagination(Dummy)({
      searchParameters: {page: 666},
    });
    const {helper, refine} = wrapper.find(Dummy).props();
    refine(667);
    expect(helper.getState().page).toBe(667);
    expect(helper.search.mock.calls.length).toBe(1);
  });
});
