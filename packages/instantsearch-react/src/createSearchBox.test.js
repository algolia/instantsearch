/* eslint-env jest, jasmine */

import React from 'react';
import {mount, shallow} from 'enzyme';

import {AlgoliaSearchHelper} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import createSearchBox from './createSearchBox';
jest.unmock('./createSearchBox');

describe('createSearchBox', () => {
  it('provides the correct props to the component', () => {
    const SearchBox = createSearchBox(props => {
      expect(Object.keys(props).length).toBe(4);
      expect(props.initialQuery).toBe('foo');
      expect(typeof props.refine).toBe('function');
      expect(props.helper).toEqual(jasmine.any(AlgoliaSearchHelper));
      return null;
    });
    shallow(<SearchBox __state={{searchParameters: {query: 'foo'}}} />);
  });

  it('can refine its query', () => {
    const Dummy = () => null;
    const SearchBox = createSearchBox(Dummy);
    const wrapper = mount(
      <SearchBox
        __state={{
          searchParameters: {query: 'foo'},
        }}
      />
    );
    const {helper, refine} = wrapper.find(Dummy).props();
    refine('bar');
    expect(helper.getState().query).toBe('bar');
    expect(helper.search.mock.calls.length).toBe(1);
  });
});
