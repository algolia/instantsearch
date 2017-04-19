/* eslint-env jest, jasmine */

import React from 'react';
import {mount} from 'enzyme';
import renderer from 'react/lib/ReactTestRenderer';

import HitsPerPage from './HitsPerPage';
jest.unmock('./HitsPerPage');
jest.unmock('./utils');

describe('HitsPerPage', () => {
  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <HitsPerPage
        values={[111, 333, 666]}
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

  it('applies default translations', () => {
    const tree = renderer.create(
      <HitsPerPage
        values={[111, 333, 666]}
        hitsPerPage={111}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer.create(
      <HitsPerPage
        values={[111, 333, 666]}
        translations={{
          label: 'HITS_LABEL',
          value: v => `HITS_VALUE_${v}`,
        }}
        hitsPerPage={111}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
