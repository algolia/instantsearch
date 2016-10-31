/* eslint-env jest, jasmine */

// @TODO re-include this test in the normal .test.js
// when React 15.4 is out: https://github.com/facebook/react/issues/7386

import React from 'react';
import {mount} from 'enzyme';
import RefinementList from './RefinementList';

describe('RefinementList', () => {
  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <RefinementList
        refine={refine}
        createURL={() => '#'}
        items={[
          {value: 'white', count: 10},
          {value: 'black', count: 20},
          {value: 'blue', count: 30},
        ]}
        currentRefinement={[]}
        selectedItems={[]}
      />
    );

    const items = wrapper.find('.item');

    expect(items.length).toBe(3);

    const firstItem = items.first().find('.itemCheckbox');

    firstItem.simulate('change', {target: {checked: true}});

    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual(['white']);

    wrapper.unmount();
  });

  it('should respect defined limits', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <RefinementList
        refine={refine}
        createURL={() => '#'}
        items={[
          {value: 'white', count: 10},
          {value: 'black', count: 20},
          {value: 'blue', count: 30},
          {value: 'red', count: 30},
          {value: 'green', count: 30},
        ]}
        limitMin={2}
        limitMax={4}
        showMore={true}
        currentRefinement={[]}
        selectedItems={[]}
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
      <RefinementList
        refine={refine}
        createURL={() => '#'}
        items={[
          {value: 'white', count: 10},
          {value: 'black', count: 20},
        ]}
        limitMin={2}
        limitMax={4}
        showMore={true}
        currentRefinement={[]}
        selectedItems={[]}
      />
    );

    const items = wrapper.find('.item');

    expect(items.length).toBe(2);

    expect(wrapper.find('.showMoreDisabled')).toBeDefined();

    wrapper.unmount();
  });
});
