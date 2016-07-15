/* eslint-env jest, jasmine */

jest.mock('algoliasearch-helper-provider/src/connect', () =>
  require.requireActual(
    '../__mocks__/algoliasearch-helper-provider/src/connect'
  )
);

import {AlgoliaSearchHelper} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import createSearchBox from './createSearchBox';
jest.unmock('./createSearchBox');

describe('createSearchBox', () => {
  it('provides the correct props to the component', () => {
    createSearchBox(props => {
      expect(Object.keys(props).length).toBe(4);
      expect(props.query).toBe('foo');
      expect(typeof props.setQuery).toBe('function');
      expect(typeof props.setQuery).toBe('function');
      expect(props.helper).toEqual(jasmine.any(AlgoliaSearchHelper));
      return null;
    })({searchParameters: {query: 'foo'}});
  });

  it('can set the query parameter', () => {
    const Dummy = () => null;
    const wrapper = createSearchBox(Dummy)({
      searchParameters: {query: 'foo'},
    });
    const {helper, setQuery} = wrapper.find(Dummy).props();
    setQuery('bar');
    expect(helper.getState().query).toBe('bar');
    expect(helper.search.mock.calls.length).toBe(0);
  });

  it('can execute a search', () => {
    const Dummy = () => null;
    const wrapper = createSearchBox(Dummy)({
      searchParameters: {query: 'foo'},
    });
    const {helper, search} = wrapper.find(Dummy).props();
    search();
    expect(helper.search.mock.calls.length).toBe(1);
  });
});
