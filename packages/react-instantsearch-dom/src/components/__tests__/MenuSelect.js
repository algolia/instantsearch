/**
 * @jest-environment jsdom
 */

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import React from 'react';
import renderer from 'react-test-renderer';

import MenuSelect from '../MenuSelect';

Enzyme.configure({ adapter: new Adapter() });

describe('MenuSelect', () => {
  it('default menu select', () => {
    const tree = renderer
      .create(
        <MenuSelect
          refine={() => {}}
          items={[
            { label: 'white', value: 'white', count: 10, isRefined: false },
            { label: 'black', value: 'black', count: 20, isRefined: false },
            { label: 'blue', value: 'blue', count: 30, isRefined: false },
            { label: 'green', value: 'green', count: 30, isRefined: false },
            { label: 'red', value: 'red', count: 30, isRefined: false },
          ]}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('default menu select with custom className', () => {
    const tree = renderer
      .create(
        <MenuSelect
          className="MyCustomMenuSelect"
          refine={() => {}}
          items={[
            { label: 'white', value: 'white', count: 10, isRefined: false },
            { label: 'black', value: 'black', count: 20, isRefined: false },
            { label: 'blue', value: 'blue', count: 30, isRefined: false },
            { label: 'green', value: 'green', count: 30, isRefined: false },
            { label: 'red', value: 'red', count: 30, isRefined: false },
          ]}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('default menu select with custom id', () => {
    const id = 'menu-select';
    const wrapper = mount(
      <MenuSelect id={id} refine={() => {}} items={[]} canRefine={false} />
    );

    const select = wrapper.find('select').getDOMNode();
    expect(select.getAttribute('id')).toEqual(id);
  });

  it('default menu select with no refinement', () => {
    const tree = renderer
      .create(<MenuSelect refine={() => {}} items={[]} canRefine={false} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer
      .create(
        <MenuSelect
          refine={() => {}}
          items={[
            { label: 'white', value: 'white', count: 10, isRefined: false },
            { label: 'black', value: 'black', count: 20, isRefined: false },
            { label: 'blue', value: 'blue', count: 30, isRefined: false },
            { label: 'green', value: 'green', count: 30, isRefined: false },
            { label: 'red', value: 'red', count: 30, isRefined: false },
          ]}
          translations={{
            seeAllOption: 'Everything',
          }}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <MenuSelect
        refine={refine}
        items={[
          { label: 'white', value: 'white', count: 10, isRefined: false },
          { label: 'black', value: 'black', count: 20, isRefined: false },
          { label: 'blue', value: 'blue', count: 30, isRefined: false },
        ]}
        canRefine={true}
      />
    );

    const items = wrapper.find('option');
    expect(items).toHaveLength(4); // +1 from "see all option"

    wrapper.find('select').simulate('change', { target: { value: 'blue' } });

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith('blue');

    wrapper.unmount();
  });
});
