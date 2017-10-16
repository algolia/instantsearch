import PropTypes from 'prop-types';
/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

import RangeInput, { RawRangeInput } from './RangeInput';

describe('RangeInput', () => {
  it('supports passing max/min values', () => {
    const tree = renderer
      .create(
        <RangeInput
          createURL={() => '#'}
          refine={() => null}
          min={0}
          max={100}
          currentRefinement={{ min: 0, max: 100 }}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer
      .create(
        <RangeInput
          createURL={() => '#'}
          refine={() => null}
          translations={{
            submit: 'SUBMIT',
            separator: 'SEPARATOR',
          }}
          min={0}
          max={100}
          currentRefinement={{ min: 0, max: 100 }}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('expect to applies changes when props have changed ', () => {
    const wrapper = shallow(
      <RawRangeInput
        createURL={() => '#'}
        refine={() => {}}
        min={0}
        max={100}
        currentRefinement={{ min: 0, max: 100 }}
        canRefine={false}
        translate={x => x}
      />
    );

    wrapper.setProps({
      canRefine: true,
      currentRefinement: {
        min: 10,
        max: 90,
      },
    });

    wrapper.update();

    expect(wrapper.state()).toEqual({
      from: 10,
      to: 90,
    });
  });

  it("expect to don't applies changes when props don't have changed", () => {
    const wrapper = shallow(
      <RawRangeInput
        createURL={() => '#'}
        refine={() => {}}
        min={0}
        max={100}
        currentRefinement={{ min: 0, max: 100 }}
        canRefine={true}
        translate={x => x}
      />
    );

    wrapper.setState({
      from: 10,
      to: 90,
    });

    wrapper.setProps({
      canRefine: true,
      currentRefinement: {
        min: 0,
        max: 100,
      },
    });

    wrapper.update();

    expect(wrapper.state()).toEqual({
      from: 10,
      to: 90,
    });
  });

  it('expect to call context canRefine when props changed', () => {
    const context = {
      canRefine: jest.fn(),
    };

    const wrapper = shallow(
      <RawRangeInput
        createURL={() => '#'}
        refine={() => {}}
        min={0}
        max={100}
        currentRefinement={{ min: 0, max: 100 }}
        canRefine={true}
        translate={x => x}
      />,
      {
        context,
      }
    );

    wrapper.setProps({
      canRefine: false,
    });

    expect(context.canRefine).toHaveBeenCalledTimes(2);
  });

  it("expect to not call context canRefine when props don't have changed", () => {
    const context = {
      canRefine: jest.fn(),
    };

    const wrapper = shallow(
      <RawRangeInput
        createURL={() => '#'}
        refine={() => {}}
        min={0}
        max={100}
        currentRefinement={{ min: 0, max: 100 }}
        canRefine={true}
        translate={x => x}
      />,
      {
        context,
      }
    );

    wrapper.setProps({
      canRefine: true,
    });

    expect(context.canRefine).toHaveBeenCalledTimes(1);
  });

  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <RangeInput
        createURL={() => '#'}
        refine={refine}
        min={0}
        max={100}
        currentRefinement={{ min: 0, max: 100 }}
        canRefine={true}
      />
    );

    const formChildren = wrapper.find('.ais-RangeInput__submit');
    wrapper
      .find('.ais-RangeInput__root')
      .simulate('submit', { target: { formChildren } });

    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual({ min: 0, max: 100 });

    refine.mockClear();

    wrapper
      .find('input')
      .first()
      .simulate('change', { target: { value: 89 } });
    wrapper
      .find('input')
      .last()
      .simulate('change', { target: { value: 99 } });

    wrapper
      .find('.ais-RangeInput__root')
      .simulate('submit', { target: { formChildren } });

    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual({ min: 89, max: 99 });

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
        currentRefinement={{ min: 0, max: 100 }}
        canRefine={true}
      />
    );

    const formChildren = wrapper.find('.ais-RangeInput__submit');

    wrapper
      .find('input')
      .first()
      .simulate('change', { target: { value: '' } });
    wrapper
      .find('input')
      .last()
      .simulate('change', { target: { value: '' } });

    wrapper
      .find('.ais-RangeInput__root')
      .simulate('submit', { target: { formChildren } });

    expect(refine.mock.calls.length).toBe(0);

    wrapper.unmount();
  });

  describe('Panel compatibility', () => {
    it('Should indicate when no more refinement', () => {
      const canRefine = jest.fn();
      const wrapper = mount(
        <RangeInput
          createURL={() => '#'}
          refine={() => {}}
          min={0}
          max={100}
          currentRefinement={{ min: 0, max: 100 }}
          canRefine={true}
        />,
        {
          context: { canRefine },
          childContextTypes: { canRefine: PropTypes.func },
        }
      );

      expect(canRefine.mock.calls.length).toBe(1);
      expect(canRefine.mock.calls[0][0]).toEqual(true);
      expect(wrapper.find('.ais-RangeInput__noRefinement').length).toBe(0);

      wrapper.setProps({ canRefine: false });

      expect(canRefine.mock.calls.length).toBe(2);
      expect(canRefine.mock.calls[1][0]).toEqual(false);
      expect(wrapper.find('.ais-RangeInput__noRefinement').length).toBe(1);
    });
  });
});
