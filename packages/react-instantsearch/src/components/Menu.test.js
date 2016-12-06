/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';

import Menu from './Menu';

describe('Menu', () => {
  it('default menu', () => {
    const tree = renderer.create(
      <Menu
        refine={() => null}
        createURL={() => '#'}
        items={[
          {label: 'white', value: 'white', count: 10, isRefined: false},
          {label: 'black', value: 'black', count: 20, isRefined: false},
          {label: 'blue', value: 'blue', count: 30, isRefined: false},
          {label: 'green', value: 'green', count: 30, isRefined: false},
          {label: 'red', value: 'red', count: 30, isRefined: false},
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
      <Menu
        refine={() => null}
        createURL={() => '#'}
        items={[
          {label: 'white', value: 'white', count: 10, isRefined: false},
          {label: 'black', value: 'black', count: 20, isRefined: false},
          {label: 'blue', value: 'blue', count: 30, isRefined: false},
          {label: 'green', value: 'green', count: 30, isRefined: false},
          {label: 'red', value: 'red', count: 30, isRefined: false},
        ]}
        limitMin={2}
        limitMax={4}
        showMore={true}
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
        <Menu
          refine={refine}
          createURL={() => '#'}
          items={[
            {label: 'white', value: 'white', count: 10, isRefined: false},
            {label: 'black', value: 'black', count: 20, isRefined: false},
            {label: 'blue', value: 'blue', count: 30, isRefined: false},
          ]}
        />
      );

    const items = wrapper.find('.ais-Menu__item');

    expect(items.length).toBe(3);

    const firstItem = items.first().find('.ais-Menu__itemLink');

    firstItem.simulate('click');

    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual('white');

    wrapper.unmount();
  });

  it('should respect defined limits', () => {
    const refine = jest.fn();
    const wrapper = mount(
        <Menu
          refine={refine}
          createURL={() => '#'}
          items={[
            {label: 'white', value: 'white', count: 10, isRefined: false},
            {label: 'black', value: 'black', count: 20, isRefined: false},
            {label: 'blue', value: 'blue', count: 30, isRefined: false},
            {label: 'green', value: 'green', count: 30, isRefined: false},
            {label: 'red', value: 'red', count: 30, isRefined: false},
          ]}
          limitMin={2}
          limitMax={4}
          showMore={true}
        />
      );

    const items = wrapper.find('.ais-Menu__item');

    expect(items.length).toBe(2);

    wrapper.find('.ais-Menu__showMore').simulate('click');

    expect(wrapper.find('.ais-Menu__item').length).toBe(4);

    wrapper.unmount();
  });

  it('should disabled show more when no more item to display', () => {
    const refine = jest.fn();
    const wrapper = mount(
        <Menu
          refine={refine}
          createURL={() => '#'}
          items={[
            {label: 'white', value: 'white', count: 10, isRefined: false},
            {label: 'black', value: 'black', count: 20, isRefined: false},
          ]}
          limitMin={2}
          limitMax={4}
          showMore={true}
        />
      );

    const items = wrapper.find('.ais-Menu__item');

    expect(items.length).toBe(2);

    expect(wrapper.find('.ais-Menu__showMoreDisabled')).toBeDefined();

    wrapper.unmount();
  });
});
