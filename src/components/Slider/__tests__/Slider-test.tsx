/** @jsx h */

import { h } from 'preact';
import { shallow } from 'enzyme';
import Slider, { SliderProps } from '../Slider';
import { ReactElementLike } from 'prop-types';

describe('Slider', () => {
  it('expect to render correctly', () => {
    const tree = shallow(
      (
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
      ) as ReactElementLike
    );

    expect(tree).toMatchSnapshot();
  });

  it('expect to render without pips', () => {
    const tree = shallow(
      (
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
      ) as ReactElementLike
    );

    expect(tree).toMatchSnapshot();
  });

  it('expect to render with CSS classes', () => {
    const tree = shallow(
      (
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
      ) as ReactElementLike
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

    const Rheostat = shallow((<Slider {...props} />) as ReactElementLike).find(
      'Rheostat'
    );

    // @ts-expect-error onChange on Rheostat doesn't follow form event
    Rheostat.props().onChange!({ values: [0, 100] });

    expect(props.refine).toHaveBeenCalledTimes(1);
    expect(props.refine).toHaveBeenCalledWith([0, 100]);
  });
});
