/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';

import StarRating from './StarRating';

describe('StarRating', () => {
  it('supports passing max/min values', () => {
    const tree = renderer.create(
      <StarRating
        createURL={() => '#'}
        refine={() => null}
        min={1}
        max={5}
        currentRefinement={{min: 1, max: 5}}
        count={[{value: '1', count: 1},
          {value: '2', count: 2},
          {value: '3', count: 3},
          {value: '4', count: 4},
          {value: '5', count: 5}]}
        canRefine={true}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer.create(
      <StarRating
        createURL={() => '#'}
        refine={() => null}
        translations={{
          ratingLabel: ' & Up',
        }}
        min={1}
        max={5}
        currentRefinement={{min: 1, max: 5}}
        count={[{value: '1', count: 1},
          {value: '2', count: 2},
          {value: '3', count: 3},
          {value: '4', count: 4},
          {value: '5', count: 5}]}
        canRefine={true}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  const refine = jest.fn();
  const createURL = jest.fn();
  const starRating = <StarRating
    createURL={createURL}
    refine={refine}
    min={1}
    max={5}
    currentRefinement={{min: 1, max: 5}}
    count={[{value: '1', count: 1},
      {value: '2', count: 2},
      {value: '3', count: 3},
      {value: '4', count: 3},
      {value: '5', count: 0}]}
    canRefine={true}
  />;

  beforeEach(() => {
    refine.mockClear();
    createURL.mockClear();
  });

  it('should create an URL for each row except for the largest: the default selected one', () => {
    const wrapper = mount(starRating);

    expect(createURL.mock.calls.length).toBe(4);
    expect(createURL.mock.calls[0][0]).toEqual({min: 5, max: 5});
    expect(createURL.mock.calls[1][0]).toEqual({min: 4, max: 5});
    expect(createURL.mock.calls[2][0]).toEqual({min: 3, max: 5});
    expect(createURL.mock.calls[3][0]).toEqual({min: 2, max: 5});

    wrapper.unmount();
  });

  it('refines its value on change', () => {
    const wrapper = mount(starRating);
    const links = wrapper.find('.ais-StarRating__ratingLink');
    expect(links.length).toBe(5);

    let selectedLink = wrapper.find('.ais-StarRating__ratingLinkSelected');
    expect(selectedLink.length).toBe(1);

    links.first().simulate('click');

    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual({min: 5, max: 5});

    selectedLink = wrapper
      .find('.ais-StarRating__ratingLinkSelected');
    expect(selectedLink).toBeDefined();

    refine.mockClear();

    const disabledLink = wrapper
      .find('.ais-StarRating__ratingLinkDisabled')
      .find('.ais-StarRating__ratingIcon');

    expect(disabledLink.length).toBe(5);
    wrapper.unmount();
  });

  it('should display the right number of stars', () => {
    const wrapper = mount(starRating);
    wrapper
      .find('.ais-StarRating__ratingLink')
      .last()
      .simulate('click');

    const selectedLink = wrapper
      .find('.ais-StarRating__ratingLinkSelected');

    const fullIcon = selectedLink
      .find('.ais-StarRating__ratingIcon');
    const emptyIcon = selectedLink
      .first().find('.ais-StarRating__ratingIconEmpty');

    expect(fullIcon.length).toBe(1);
    expect(emptyIcon.length).toBe(4);
    wrapper.unmount();
  });

  it('clicking on the selected refinement should select the largest range', () => {
    const wrapper = mount(starRating);
    wrapper.setProps({currentRefinement: {min: 5, max: 5}});

    const links = wrapper.find('.ais-StarRating__ratingLink');
    links.first().simulate('click');

    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual({min: 1, max: 5});
    wrapper.unmount();
  });
  describe('Panel compatibility', () => {
    it('Should indicate when no more refinement', () => {
      const canRefine = jest.fn();
      const wrapper = mount(
        starRating,
        {
          context: {canRefine},
          childContextTypes: {canRefine: React.PropTypes.func},
        },
      );

      expect(canRefine.mock.calls.length).toBe(1);
      expect(canRefine.mock.calls[0][0]).toEqual(true);
      expect(wrapper.find('.ais-StarRating__noRefinement').length).toBe(0);

      wrapper.setProps({canRefine: false});

      expect(canRefine.mock.calls.length).toBe(2);
      expect(canRefine.mock.calls[1][0]).toEqual(false);
      expect(wrapper.find('.ais-StarRating__noRefinement').length).toBe(1);
    });
  });
});
