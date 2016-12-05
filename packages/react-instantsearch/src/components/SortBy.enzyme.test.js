/* eslint-env jest, jasmine */

// @TODO re-include this test in the normal .test.js
// when React 15.4 is out: https://github.com/facebook/react/issues/7386

import React from 'react';
import {mount} from 'enzyme';

import SortBy from './SortBy';

describe('SortBy behavior', () => {
  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <SortBy
        createURL={() => '#'}
        items={[{value: 'index1', label: 'index name 1'},
          {value: 'index2', label: 'index name 2'},
          {value: 'index3', label: 'index name 3'},
          {value: 'index4', label: 'index name 4'}]}
        currentRefinement={'index1'}
        refine={refine}
      />
    );

    const selectedValue = wrapper
      .find('.ais-SortBy__root');
    expect(selectedValue.find('option').length).toBe(4);
    expect(selectedValue.find('option').first().text()).toBe('index name 1');

    selectedValue.find('select').simulate('change', {target: {value: 'index3'}});

    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual('index3');
  });

  it('should use value if no label provided', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <SortBy
        createURL={() => '#'}
        items={[{value: 'index1'},
          {value: 'index2'},
          {value: 'index3'},
          {value: 'index4'}]}
        refine={refine}
        currentRefinement={'index1'}
      />
    );

    const selectedValue = wrapper
      .find('.ais-SortBy__root');
    expect(selectedValue.find('option').length).toBe(4);
    expect(selectedValue.find('option').first().text()).toBe('index1');
  });
});
