/* eslint-env jest, jasmine */

// @TODO re-include this test in the normal .test.js
// when React 15.4 is out: https://github.com/facebook/react/issues/7386

import React from 'react';
import {mount} from 'enzyme';
import RangeRatings from './RangeRatings';

describe('RangeRatings', () => {
  const refine = jest.fn();
  const wrapper = mount(
    <RangeRatings
      createURL={() => '#'}
      refine={refine}
      min={1}
      max={5}
      value={{min: 1, max: 5}}
      count={[{value: '1', count: 1},
        {value: '2', count: 2},
        {value: '3', count: 3},
        {value: '4', count: 3},
        {value: '5', count: 0}]}
    />
  );

  beforeEach(() => {
    refine.mockClear();
  });

  afterAll(() => {
    wrapper.unmount();
  });

  it('refines its value on change', () => {
    const links = wrapper.find('.RangeRatings__link');
    expect(links.length).toBe(5);

    let selectedLink = wrapper.find('.RangeRatings__link--selected');
    expect(selectedLink.length).toBe(1);

    links.first().simulate('click');

    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual({min: 5, max: 5});

    selectedLink = wrapper
      .find('.RangeRatings__link--selected');
    expect(selectedLink).toBeDefined();

    refine.mockClear();

    const disabledLink = wrapper
      .find('.RangeRatings__link--disabled')
      .find('.RangeRatings__link__icon');

    expect(disabledLink.length).toBe(5);
  });

  it('should display the right number of stars', () => {
    wrapper
      .find('.RangeRatings__link')
      .last()
      .simulate('click');

    const selectedLink = wrapper
      .find('.RangeRatings__link--selected');

    const fullIcon = selectedLink
      .find('.RangeRatings__link__icon');
    const emptyIcon = selectedLink
      .first().find('.RangeRatings__link__icon--empty');

    expect(fullIcon.length).toBe(1);
    expect(emptyIcon.length).toBe(4);
  });
});
