/**
 * @jest-environment jsdom
 */

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import React from 'react';
import renderer from 'react-test-renderer';

import ClearRefinements from '../ClearRefinements';

Enzyme.configure({ adapter: new Adapter() });

describe('ClearRefinements', () => {
  it('renders a clickable button', () =>
    expect(
      renderer
        .create(
          <ClearRefinements
            items={[{ filter: 1 }]}
            canRefine={true}
            refine={() => null}
          />
        )
        .toJSON()
    ).toMatchSnapshot());

  it('renders a clickable button with a custom className', () =>
    expect(
      renderer
        .create(
          <ClearRefinements
            className="MyCustomClearRefinements"
            items={[{ filter: 1 }]}
            canRefine={true}
            refine={() => null}
          />
        )
        .toJSON()
    ).toMatchSnapshot());

  it('has a disabled mode', () =>
    expect(
      renderer
        .create(
          <ClearRefinements items={[]} canRefine={false} refine={() => null} />
        )
        .toJSON()
    ).toMatchSnapshot());

  it('is disabled when there is no filters', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <ClearRefinements items={[]} canRefine={false} refine={refine} />
    );

    expect(refine.mock.calls).toHaveLength(0);
    wrapper.find('button').simulate('click');
    expect(refine.mock.calls).toHaveLength(0);
  });

  it('is not disabled when there are filters', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <ClearRefinements
        items={[{ value: 'test', label: 'test: test' }]}
        canRefine={true}
        refine={refine}
      />
    );

    expect(refine.mock.calls).toHaveLength(0);
    wrapper.find('button').simulate('click');
    expect(refine.mock.calls).toHaveLength(1);
  });
});
