/**
 * @jest-environment jsdom
 */

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import React from 'react';
import renderer from 'react-test-renderer';

import RatingMenu from '../RatingMenu';

Enzyme.configure({ adapter: new Adapter() });

describe('RatingMenu', () => {
  it('supports passing max/min values', () => {
    const tree = renderer
      .create(
        <RatingMenu
          createURL={() => '#'}
          refine={() => null}
          min={1}
          max={5}
          currentRefinement={{ min: 1, max: 5 }}
          count={[
            { value: '1', count: 1 },
            { value: '2', count: 2 },
            { value: '3', count: 3 },
            { value: '4', count: 4 },
            { value: '5', count: 5 },
          ]}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('supports passing max/min values smaller than count max & min', () => {
    const tree = renderer
      .create(
        <RatingMenu
          createURL={() => '#'}
          refine={() => null}
          min={2}
          max={4}
          currentRefinement={{}}
          count={[
            { value: '1', count: 1 },
            { value: '2', count: 2 },
            { value: '3', count: 3 },
            { value: '4', count: 4 },
            { value: '5', count: 5 },
          ]}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('supports passing custom className', () => {
    const tree = renderer
      .create(
        <RatingMenu
          className="MyCustomRatingMenu"
          createURL={() => '#'}
          refine={() => null}
          min={1}
          max={5}
          currentRefinement={{ min: 1, max: 5 }}
          count={[
            { value: '1', count: 1 },
            { value: '2', count: 2 },
            { value: '3', count: 3 },
            { value: '4', count: 4 },
            { value: '5', count: 5 },
          ]}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('expect to render without refinement', () => {
    const tree = renderer
      .create(
        <RatingMenu
          createURL={() => '#'}
          refine={() => null}
          min={1}
          max={5}
          currentRefinement={{ min: 1, max: 5 }}
          count={[
            { value: '1', count: 1 },
            { value: '2', count: 2 },
            { value: '3', count: 3 },
            { value: '4', count: 4 },
            { value: '5', count: 5 },
          ]}
          canRefine={false}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer
      .create(
        <RatingMenu
          createURL={() => '#'}
          refine={() => null}
          translations={{
            ratingLabel: ' & Up',
          }}
          min={1}
          max={5}
          currentRefinement={{ min: 1, max: 5 }}
          count={[
            { value: '1', count: 1 },
            { value: '2', count: 2 },
            { value: '3', count: 3 },
            { value: '4', count: 4 },
            { value: '5', count: 5 },
          ]}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('expect to not throw when only min is defined', () => {
    expect(() => {
      renderer.create(
        <RatingMenu
          createURL={() => '#'}
          refine={() => null}
          translations={{
            ratingLabel: ' & Up',
          }}
          min={3}
          currentRefinement={{ min: 1, max: 5 }}
          count={[
            { value: '1', count: 1 },
            { value: '2', count: 2 },
            { value: '3', count: 3 },
            { value: '4', count: 4 },
            { value: '5', count: 5 },
          ]}
          canRefine={true}
        />
      );
    }).not.toThrow();
  });

  it('expect to render when only max is defined', () => {
    const tree = renderer
      .create(
        <RatingMenu
          createURL={() => '#'}
          refine={() => null}
          translations={{
            ratingLabel: ' & Up',
          }}
          max={3}
          currentRefinement={{ min: 1, max: 5 }}
          count={[
            { value: '1', count: 1 },
            { value: '2', count: 2 },
            { value: '3', count: 3 },
            { value: '4', count: 4 },
            { value: '5', count: 5 },
          ]}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('expect to render from from 1 when min is negative', () => {
    const tree = renderer
      .create(
        <RatingMenu
          createURL={() => '#'}
          refine={() => null}
          translations={{
            ratingLabel: ' & Up',
          }}
          min={-5}
          max={5}
          currentRefinement={{ min: 1, max: 5 }}
          count={[
            { value: '1', count: 1 },
            { value: '2', count: 2 },
            { value: '3', count: 3 },
            { value: '4', count: 4 },
            { value: '5', count: 5 },
          ]}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('expect to render nothing when min is higher than max', () => {
    const tree = renderer
      .create(
        <RatingMenu
          createURL={() => '#'}
          refine={() => null}
          translations={{
            ratingLabel: ' & Up',
          }}
          min={5}
          max={3}
          currentRefinement={{ min: 1, max: 5 }}
          count={[
            { value: '1', count: 1 },
            { value: '2', count: 2 },
            { value: '3', count: 3 },
            { value: '4', count: 4 },
            { value: '5', count: 5 },
          ]}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  const refine = jest.fn();
  const createURL = jest.fn();
  const ratingMenu = (
    <RatingMenu
      createURL={createURL}
      refine={refine}
      min={1}
      max={5}
      currentRefinement={{ min: 1, max: 5 }}
      count={[
        { value: '1', count: 4 },
        { value: '2', count: 2 },
        { value: '3', count: 3 },
        { value: '4', count: 3 },
        { value: '5', count: 0 },
      ]}
      canRefine={true}
    />
  );

  beforeEach(() => {
    refine.mockClear();
    createURL.mockClear();
  });

  it('should create an URL for each row except for the largest: the default selected one', () => {
    const wrapper = mount(ratingMenu);

    expect(createURL.mock.calls).toHaveLength(3);
    expect(createURL.mock.calls[0][0]).toEqual({ min: 4, max: 5 });
    expect(createURL.mock.calls[1][0]).toEqual({ min: 3, max: 5 });
    expect(createURL.mock.calls[2][0]).toEqual({ min: 2, max: 5 });

    wrapper.unmount();
  });

  it('refines its value on change', () => {
    const wrapper = mount(ratingMenu);
    const links = wrapper.find('.ais-RatingMenu-link');
    expect(links).toHaveLength(5);

    let selectedItem = wrapper.find('.ais-RatingMenu-item--selected');
    expect(selectedItem).toHaveLength(1);

    links.first().simulate('click');

    expect(refine.mock.calls).toHaveLength(0);

    selectedItem = wrapper.find('.ais-RatingMenu-item--selected');
    expect(selectedItem).toBeDefined();

    const disabledIcon = wrapper
      .find('.ais-RatingMenu-item--disabled')
      .find('.ais-RatingMenu-starIcon');

    expect(disabledIcon).toHaveLength(5);
    wrapper.unmount();
  });

  it('should display the right number of stars', () => {
    const wrapper = mount(ratingMenu);
    wrapper.find('.ais-RatingMenu-link').last().simulate('click');

    const selectedItem = wrapper.find('.ais-RatingMenu-item--selected');

    const fullIcon = selectedItem.find('.ais-RatingMenu-starIcon--full');
    const emptyIcon = selectedItem.find('.ais-RatingMenu-starIcon--empty');

    expect(fullIcon).toHaveLength(1);
    expect(emptyIcon).toHaveLength(4);
    wrapper.unmount();
  });

  it('clicking on the selected refinement should select the largest range', () => {
    const wrapper = mount(ratingMenu);
    wrapper.setProps({ currentRefinement: { min: 4, max: 5 } });

    const links = wrapper.find('.ais-RatingMenu-link');
    links.at(1).simulate('click');

    expect(refine.mock.calls).toHaveLength(1);
    expect(refine.mock.calls[0][0]).toEqual({ min: 1, max: 5 });
    wrapper.unmount();
  });
});
