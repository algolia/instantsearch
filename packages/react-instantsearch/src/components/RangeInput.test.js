/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';

import RangeInput from './RangeInput';

describe('RangeInput', () => {
  it('supports passing max/min values', () => {
    const tree = renderer.create(
      <RangeInput
        createURL={() => '#'}
        refine={() => null}
        min={0}
        max={100}
        currentRefinement={{min: 0, max: 100}}
        canRefine={true}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer.create(
      <RangeInput
        createURL={() => '#'}
        refine={() => null}
        translations={{
          submit: 'SUBMIT',
          separator: 'SEPARATOR',
        }}
        min={0}
        max={100}
        currentRefinement={{min: 0, max: 100}}
        canRefine={true}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
        <RangeInput
          createURL={() => '#'}
          refine={refine}
          min={0}
          max={100}
          currentRefinement={{min: 0, max: 100}}
          canRefine={true}
        />
      );

    const formChildren = wrapper.find('.ais-RangeInput__submit');
    wrapper
        .find('.ais-RangeInput__root')
        .simulate('submit', {target: {formChildren}});

    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual({min: 0, max: 100});

    refine.mockClear();

    wrapper.find('input').first().simulate('change', {target: {value: 89}});
    wrapper.find('input').last().simulate('change', {target: {value: 99}});

    wrapper
        .find('.ais-RangeInput__root')
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
          currentRefinement={{min: 0, max: 100}}
          canRefine={true}
        />
      );

    const formChildren = wrapper.find('.ais-RangeInput__submit');

    wrapper.find('input').first().simulate('change', {target: {value: ''}});
    wrapper.find('input').last().simulate('change', {target: {value: ''}});

    wrapper
        .find('.ais-RangeInput__root')
        .simulate('submit', {target: {formChildren}});

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
          currentRefinement={{min: 0, max: 100}}
          canRefine={true}
        />,
        {
          context: {canRefine},
          childContextTypes: {canRefine: React.PropTypes.func},
        },
      );

      expect(canRefine.mock.calls.length).toBe(1);
      expect(canRefine.mock.calls[0][0]).toEqual(true);
      expect(wrapper.find('.ais-RangeInput__noRefinement').length).toBe(0);

      wrapper.setProps({canRefine: false});

      expect(canRefine.mock.calls.length).toBe(2);
      expect(canRefine.mock.calls[1][0]).toEqual(false);
      expect(wrapper.find('.ais-RangeInput__noRefinement').length).toBe(1);
    });
  });
});
