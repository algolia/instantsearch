/* eslint-env jest, jasmine */

// @TODO re-include this test in the normal .test.js
// when React 15.4 is out: https://github.com/facebook/react/issues/7386

import React from 'react';
import {mount} from 'enzyme';

import HitsPerPage from './HitsPerPage';

describe('HitsPerPage', () => {
  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <HitsPerPage
        createURL={() => '#'}
        items={[111, 333, 666]}
        refine={refine}
        hitsPerPage={111}
      />
    );
    wrapper
      .find('.itemLink')
      .filterWhere(e => e.text() === '333')
      .simulate('click');
    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual(333);
    wrapper
      .find('.itemLink')
      .filterWhere(e => e.text() === '666')
      .simulate('click');
    expect(refine.mock.calls.length).toBe(2);
    expect(refine.mock.calls[1][0]).toEqual(666);
  });
});
