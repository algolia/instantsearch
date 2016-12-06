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
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  const refine = jest.fn();
  const wrapper = mount(
      <StarRating
        createURL={() => '#'}
        refine={refine}
        min={1}
        max={5}
        currentRefinement={{min: 1, max: 5}}
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
  });

  it('should display the right number of stars', () => {
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
  });
});
