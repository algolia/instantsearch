/**
 * @jest-environment jsdom
 */

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import React from 'react';
import renderer from 'react-test-renderer';

import HitsPerPage from '../HitsPerPage';

Enzyme.configure({ adapter: new Adapter() });

describe('HitsPerPage', () => {
  it('renders', () =>
    expect(
      renderer
        .create(
          <HitsPerPage
            refine={() => null}
            currentRefinement={5}
            items={[
              {
                value: 5,
                label: 'show 5 hits',
              },
              {
                value: 10,
                label: 'show 10 hits',
              },
            ]}
          />
        )
        .toJSON()
    ).toMatchSnapshot());

  it('renders with a custom className', () =>
    expect(
      renderer
        .create(
          <HitsPerPage
            className="MyCusomHitsPerPage"
            refine={() => null}
            currentRefinement={5}
            items={[
              {
                value: 5,
                label: 'show 5 hits',
              },
              {
                value: 10,
                label: 'show 10 hits',
              },
            ]}
          />
        )
        .toJSON()
    ).toMatchSnapshot());

  it('should forward the id to Select', () => {
    const id = 'ais-select';
    const wrapper = mount(
      <HitsPerPage
        id={id}
        createURL={() => '#'}
        items={[
          { value: 2, label: '2 hits per page' },
          { value: 4, label: '4 hits per page' },
          { value: 6, label: '6 hits per page' },
          { value: 8, label: '8 hits per page' },
        ]}
        refine={() => null}
        currentRefinement={2}
      />
    );

    const selectedValue = wrapper.find('select').getDOMNode();
    expect(selectedValue.getAttribute('id')).toEqual(id);
  });

  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <HitsPerPage
        createURL={() => '#'}
        items={[
          { value: 2, label: '2 hits per page' },
          { value: 4, label: '4 hits per page' },
          { value: 6, label: '6 hits per page' },
          { value: 8, label: '8 hits per page' },
        ]}
        refine={refine}
        currentRefinement={2}
      />
    );

    const selectedValue = wrapper.find('select');
    expect(selectedValue.find('option')).toHaveLength(4);
    expect(selectedValue.find('option').first().text()).toBe('2 hits per page');

    selectedValue.find('select').simulate('change', { target: { value: '6' } });

    expect(refine.mock.calls).toHaveLength(1);
    expect(refine.mock.calls[0][0]).toEqual('6');
  });

  it('should use value if no label provided', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <HitsPerPage
        createURL={() => '#'}
        items={[{ value: 2 }, { value: 4 }, { value: 6 }, { value: 8 }]}
        refine={refine}
        currentRefinement={2}
      />
    );

    const selectedValue = wrapper.find('select');
    expect(selectedValue.find('option')).toHaveLength(4);
    expect(selectedValue.find('option').first().text()).toBe('2');
  });
});
