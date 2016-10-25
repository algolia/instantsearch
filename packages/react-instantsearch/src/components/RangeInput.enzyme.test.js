/* eslint-env jest, jasmine */

// @TODO re-include this test in the normal .test.js
// when React 15.4 is out: https://github.com/facebook/react/issues/7386

import React from 'react';
import {mount} from 'enzyme';
import RangeInput from './RangeInput';

describe('RangeInput', () => {
  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <RangeInput
        createURL={() => '#'}
        refine={refine}
        min={0}
        max={100}
        value={{min: 0, max: 100}}
      />
    );

    const formChildren = wrapper.find('.submit');
    wrapper
      .find('.root')
      .simulate('submit', {target: {formChildren}});

    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual({min: 0, max: 100});

    refine.mockClear();

    wrapper.find('input').first().simulate('change', {target: {value: 89}});
    wrapper.find('input').last().simulate('change', {target: {value: 99}});

    wrapper
      .find('.root')
      .simulate('submit', {target: {formChildren}});

    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual({min: 89, max: 99});

    wrapper.unmount();
  });

  it('do not refine where input value are empty string', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <RangeInput
        createURL={() => '#'}
        refine={refine}
        min={0}
        max={100}
        value={{min: 0, max: 100}}
      />
    );

    const formChildren = wrapper.find('.submit');

    wrapper.find('input').first().simulate('change', {target: {value: ''}});
    wrapper.find('input').last().simulate('change', {target: {value: ''}});

    wrapper
      .find('.root')
      .simulate('submit', {target: {formChildren}});

    expect(refine.mock.calls.length).toBe(0);

    wrapper.unmount();
  });
});
