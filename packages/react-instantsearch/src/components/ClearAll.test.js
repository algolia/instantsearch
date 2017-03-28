/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';

import ClearAll from './ClearAll';

describe('ClearAll', () => {
  it('renders a clickable button', () =>
    expect(
      renderer.create(
        <ClearAll
          refine={() => null}
          items={[{filter: 1}]}
        />
      ).toJSON()
    ).toMatchSnapshot()
  );

  it('has a disabled mode', () =>
    expect(
      renderer.create(
        <ClearAll
          refine={() => null}
          items={[]}
        />
      ).toJSON()
    ).toMatchSnapshot()
  );

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
