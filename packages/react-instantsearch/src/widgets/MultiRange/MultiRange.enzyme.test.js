/* eslint-env jest, jasmine */

// @TODO re-include this test in the normal .test.js
// when React 15.4 is out: https://github.com/facebook/react/issues/7386

import React from 'react';
import {mount} from 'enzyme';
import MultiRange from './MultiRange';

describe('RangeInput', () => {
  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <MultiRange
        refine={refine}
        items={[
          {label: 'label', value: '10:'},
          {label: 'label', value: '10:20'},
          {label: 'label', value: '20:30'},
          {label: 'label', value: '30:'},
        ]}
        selectedItem=""
      />
    );

    const items = wrapper.find('.item');

    expect(items.length).toBe(4);

    const firstItem = items.first().find('.itemRadio');

    firstItem.simulate('change', {target: {checked: true}});

    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual('10:');

    wrapper.unmount();
  });
});
