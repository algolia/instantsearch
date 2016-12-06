/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';

import HitsPerPage from './HitsPerPage';

describe('HitsPerPage', () => {
  it('renders', () =>
    expect(
      renderer.create(
        <HitsPerPage
          refine={() => null}
          currentRefinement={5}
          items={[{
            value: 5,
            label: 'show 5 hits',
          }, {
            value: 10,
            label: 'show 10 hits',
          }]}
        />
      ).toJSON()
    ).toMatchSnapshot()
  );

  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
        <HitsPerPage
          createURL={() => '#'}
          items={[{value: 2, label: '2 hits per page'},
            {value: 4, label: '4 hits per page'},
            {value: 6, label: '6 hits per page'},
            {value: 8, label: '8 hits per page'}]}
          refine={refine}
          currentRefinement={2}
        />
      );

    const selectedValue = wrapper
        .find('.ais-HitsPerPage__root');
    expect(selectedValue.find('option').length).toBe(4);
    expect(selectedValue.find('option').first().text()).toBe('2 hits per page');

    selectedValue.find('select').simulate('change', {target: {value: '6'}});

    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual('6');
  });

  it('should use value if no label provided', () => {
    const refine = jest.fn();
    const wrapper = mount(
        <HitsPerPage
          createURL={() => '#'}
          items={[{value: 2},
            {value: 4},
            {value: 6},
            {value: 8}]}
          refine={refine}
          currentRefinement={2}
        />
      );

    const selectedValue = wrapper
        .find('.ais-HitsPerPage__root');
    expect(selectedValue.find('option').length).toBe(4);
    expect(selectedValue.find('option').first().text()).toBe('2');
  });
});
