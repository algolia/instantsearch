/* eslint-env jest, jasmine */

// @TODO re-include this test in the normal .test.js
// when React 15.4 is out: https://github.com/facebook/react/issues/7386

import React from 'react';
import {mount} from 'enzyme';
import HierarchicalMenu from './HierarchicalMenu';

describe('HierarchicalMenu', () => {
  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <HierarchicalMenu
        refine={refine}
        createURL={() => '#'}
        items={[
          {value: 'white', count: 10, label: 'white',
            children: [{value: 'white1', label: 'white1', count: 3}, {value: 'white2', label: 'white2', count: 4}]},
          {value: 'black', count: 20, label: 'black'},
          {value: 'blue', count: 30, label: 'blue'},
        ]}
        currentRefinement=""
        selectedItems=""
      />
    );

    const itemParent = wrapper.find('.item .item_parent');

    expect(itemParent.length).toBe(1);

    itemParent.find('.itemLink').first().simulate('click');
    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual('white');

    wrapper.unmount();
  });

  it('should respect defined limits', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <HierarchicalMenu
        refine={refine}
        createURL={() => '#'}
        items={[
          {value: 'white', count: 10, label: 'white'},
          {value: 'black', count: 20, label: 'black'},
          {value: 'blue', count: 30, label: 'blue'},
          {value: 'green', count: 30, label: 'green'},
          {value: 'cyan', count: 30, label: 'cyan'},
        ]}
        limitMin={2}
        limitMax={4}
        showMore={true}
        currentRefinement=""
        selectedItems=""
      />
    );

    const items = wrapper.find('.item');

    expect(items.length).toBe(2);

    wrapper.find('.showMore').simulate('click');

    expect(wrapper.find('.item').length).toBe(4);

    wrapper.unmount();
  });

  it('should disabled show more when no more item to display', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <HierarchicalMenu
        refine={refine}
        createURL={() => '#'}
        items={[
          {value: 'white', count: 10, label: 'white'},
          {value: 'black', count: 20, label: 'black'},
        ]}
        limitMin={2}
        limitMax={4}
        showMore={true}
        currentRefinement=""
        selectedItems=""
      />
    );

    const items = wrapper.find('.item');

    expect(items.length).toBe(2);

    expect(wrapper.find('.showMoreDisabled')).toBeDefined();

    wrapper.unmount();
  });
});
