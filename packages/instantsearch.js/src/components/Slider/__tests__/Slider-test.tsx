/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */

import { shallow } from '@instantsearch/testutils/enzyme';
import { render, fireEvent } from '@testing-library/preact';
import { h } from 'preact';

import Slider from '../Slider';

import type { SliderProps } from '../Slider';

const ARROW_RIGHT = 39;

describe('Slider', () => {
  it('expect to render correctly', () => {
    const tree = shallow(
      <Slider
        refine={() => undefined}
        min={0}
        max={500}
        values={[0, 0]}
        pips={true}
        step={2}
        tooltips={true}
        cssClasses={{
          root: 'root',
          disabledRoot: 'disabledRoot',
        }}
      />
    );

    expect(tree).toMatchSnapshot();
  });

  it('expect to render without pips', () => {
    const tree = shallow(
      <Slider
        refine={() => undefined}
        min={0}
        max={500}
        values={[0, 0]}
        pips={false}
        step={2}
        tooltips={true}
        cssClasses={{
          root: 'root',
          disabledRoot: 'disabledRoot',
        }}
      />
    );

    expect(tree).toMatchSnapshot();
  });

  it('expect to render with CSS classes', () => {
    const tree = shallow(
      <Slider
        refine={() => undefined}
        min={0}
        max={500}
        values={[0, 0]}
        pips={false}
        step={2}
        tooltips={true}
        cssClasses={{
          root: 'root',
          disabledRoot: 'disabledRoot',
        }}
      />
    );

    expect(tree).toMatchSnapshot();
  });

  it('expect to call handleChange on change', () => {
    const props: SliderProps = {
      refine: jest.fn(),
      min: 0,
      max: 500,
      values: [0, 0],
      pips: true,
      step: 2,
      tooltips: true,
      cssClasses: {
        root: 'root',
        disabledRoot: 'disabledRoot',
      },
    };

    const Rheostat = shallow(<Slider {...props} />).find('Rheostat');

    // @ts-expect-error onChange on Rheostat doesn't follow form event
    Rheostat.props().onChange!({ values: [0, 100] });

    expect(props.refine).toHaveBeenCalledTimes(1);
    expect(props.refine).toHaveBeenCalledWith([0, 100]);
  });

  // The e-commerce examples configure rangeSlider without a `step`, so no
  // snap points are computed. The Slider still passes `snap` to Rheostat, and
  // the keyboard handler used to leave the value untouched in that case, making
  // the handles unresponsive to the keyboard. See Rheostat#getNextPositionForKey.
  it('moves the handle with the keyboard when there are no snap points', () => {
    const refine = jest.fn();
    const props: SliderProps = {
      refine,
      min: 0,
      max: 500,
      values: [100, 400],
      pips: false,
      // no `step`, so `computeSnapPoints` returns `undefined`
      tooltips: false,
      cssClasses: {
        root: 'root',
        disabledRoot: 'disabledRoot',
      },
    };

    const { container } = render(<Slider {...props} />);
    const lowerHandle = container.querySelector<HTMLDivElement>(
      '[data-handle-key="0"]'
    )!;

    fireEvent.keyDown(lowerHandle, { keyCode: ARROW_RIGHT });

    expect(refine).toHaveBeenCalledTimes(1);
    const [[lower, upper]] = refine.mock.calls.at(-1)!;
    // The lower bound moved to the right (increased) from its starting value.
    expect(lower).toBeGreaterThan(100);
    expect(upper).toBe(400);
  });
});
