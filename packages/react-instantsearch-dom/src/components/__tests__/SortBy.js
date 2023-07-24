/**
 * @jest-environment jsdom
 */

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow, mount } from 'enzyme';
import React from 'react';

import SortBy from '../SortBy';

Enzyme.configure({ adapter: new Adapter() });

describe('SortBy', () => {
  it('expect to render with custom className', () => {
    const wrapper = shallow(
      <SortBy
        className="MyCustomSortBy"
        createURL={() => '#'}
        items={[
          { value: 'index1', label: 'index name 1' },
          { value: 'index2', label: 'index name 2' },
          { value: 'index3', label: 'index name 3' },
          { value: 'index4', label: 'index name 4' },
        ]}
        currentRefinement={'index1'}
        refine={() => null}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should forward the id to Select', () => {
    const id = 'ais-select';
    const wrapper = mount(
      <SortBy
        id={id}
        items={[
          { value: 'index1' },
          { value: 'index2' },
          { value: 'index3' },
          { value: 'index4' },
        ]}
        currentRefinement={'index1'}
        refine={() => null}
      />
    );

    const select = wrapper.find('select').getDOMNode();
    expect(select.getAttribute('id')).toEqual(id);
  });

  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <SortBy
        createURL={() => '#'}
        items={[
          { value: 'index1', label: 'index name 1' },
          { value: 'index2', label: 'index name 2' },
          { value: 'index3', label: 'index name 3' },
          { value: 'index4', label: 'index name 4' },
        ]}
        currentRefinement={'index1'}
        refine={refine}
      />
    );

    const selectedValue = wrapper.find('select');
    expect(selectedValue.find('option')).toHaveLength(4);
    expect(selectedValue.find('option').first().text()).toBe('index name 1');

    selectedValue
      .find('select')
      .simulate('change', { target: { value: 'index3' } });

    expect(refine.mock.calls).toHaveLength(1);
    expect(refine.mock.calls[0][0]).toEqual('index3');
  });

  it('should use value if no label provided', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <SortBy
        createURL={() => '#'}
        items={[
          { value: 'index1' },
          { value: 'index2' },
          { value: 'index3' },
          { value: 'index4' },
        ]}
        refine={refine}
        currentRefinement={'index1'}
      />
    );

    const selectedValue = wrapper.find('select');
    expect(selectedValue.find('option')).toHaveLength(4);
    expect(selectedValue.find('option').first().text()).toBe('index1');
  });
});
