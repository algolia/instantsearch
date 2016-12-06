/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';

import RefinementList from './RefinementList';

describe('RefinementList', () => {
  it('default refinement list', () => {
    const tree = renderer.create(
      <RefinementList
        refine={() => null}
        createURL={() => '#'}
        items={[
          {label: 'white', value: ['white'], count: 10, isRefined: true},
          {label: 'black', value: ['black'], count: 20, isRefined: false},
          {label: 'blue', value: ['blue'], count: 30, isRefined: false},
        ]}
        limitMin={2}
        limitMax={4}
        showMore={true}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer.create(
      <RefinementList
        refine={() => null}
        createURL={() => '#'}
        items={[
          {label: 'white', value: ['white'], count: 10, isRefined: false},
          {label: 'black', value: ['black'], count: 20, isRefined: false},
          {label: 'blue', value: ['blue'], count: 30, isRefined: false},
        ]}
        translations={{
          showMore: ' display more',
        }}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
        <RefinementList
          refine={refine}
          createURL={() => '#'}
          items={[
            {label: 'white', value: ['white'], count: 10, isRefined: false},
            {label: 'black', value: ['black'], count: 20, isRefined: false},
            {label: 'blue', value: ['blue'], count: 30, isRefined: false},
          ]}
        />
      );

    const items = wrapper.find('.ais-RefinementList__item');

    expect(items.length).toBe(3);

    const firstItem = items.first().find('.ais-RefinementList__itemCheckbox');

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
            {label: 'white', value: ['white'], count: 10, isRefined: false},
            {label: 'black', value: ['black'], count: 20, isRefined: false},
            {label: 'blue', value: ['blue'], count: 30, isRefined: false},
            {label: 'red', value: ['red'], count: 30, isRefined: false},
            {label: 'green', value: ['green'], count: 30, isRefined: false},
          ]}
          limitMin={2}
          limitMax={4}
          showMore={true}
        />
      );

    const items = wrapper.find('.ais-RefinementList__item');

    expect(items.length).toBe(2);

    wrapper.find('.ais-RefinementList__showMore').simulate('click');

    expect(wrapper.find('.ais-RefinementList__item').length).toBe(4);

    wrapper.unmount();
  });

  it('should disabled show more when no more item to display', () => {
    const refine = jest.fn();
    const wrapper = mount(
        <RefinementList
          refine={refine}
          createURL={() => '#'}
          items={[
            {label: 'white', value: ['white'], count: 10, isRefined: false},
            {label: 'black', value: ['black'], count: 20, isRefined: false},
          ]}
          limitMin={2}
          limitMax={4}
          showMore={true}
        />
      );

    const items = wrapper.find('.ais-RefinementList__item');

    expect(items.length).toBe(2);

    expect(wrapper.find('.ais-RefinementList__showMoreDisabled')).toBeDefined();

    wrapper.unmount();
  });
});
