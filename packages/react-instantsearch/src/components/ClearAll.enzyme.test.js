
/* eslint-env jest, jasmine */

// @TODO re-include this test in the normal .test.js
// when React 15.4 is out: https://github.com/facebook/react/issues/7386

import React from 'react';
import {mount} from 'enzyme';

import ClearAll from './ClearAll.js';

describe('ClearAll behavior', () => {
  it('is disabled when there is no filters', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <ClearAll refine={refine} items={[]}/>
    );

    const btn = wrapper.find('button');
    expect(refine.mock.calls.length).toBe(0);
    btn.simulate('click');
    expect(refine.mock.calls.length).toBe(0);
  });

  it('is not disabled when there are filters', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <ClearAll refine={refine} items={[{value: 'test', label: 'test: test'}]}/>
    );

    const btn = wrapper.find('button');
    expect(refine.mock.calls.length).toBe(0);
    btn.simulate('click');
    expect(refine.mock.calls.length).toBe(1);
  });
});
