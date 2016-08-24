/* eslint-env jest, jasmine */

import React from 'react';
import {mount} from 'enzyme';

import HitsPerPageSelect from './HitsPerPageSelect';
jest.unmock('./HitsPerPageSelect');
jest.unmock('./HitsPerPage');
jest.unmock('./Select');
jest.unmock('../propTypes');
jest.unmock('../translatable');
jest.unmock('../themeable');

describe('HitsPerPageSelect', () => {
  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <HitsPerPageSelect
        items={[111, 333, 666]}
        refine={refine}
        hitsPerPage={111}
      />
    );
    wrapper.find('select').simulate('change', {target: {value: 333}});
    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual(333);
    wrapper.find('select').simulate('change', {target: {value: 666}});
    expect(refine.mock.calls.length).toBe(2);
    expect(refine.mock.calls[1][0]).toEqual(666);
  });
});
