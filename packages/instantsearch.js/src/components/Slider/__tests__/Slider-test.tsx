/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */

import { shallow } from '@instantsearch/testutils/enzyme';
import { h, render } from 'preact';

import Slider from '../Slider';

import type { SliderProps } from '../Slider';

describe('Slider', () => {
  it('expect to render correctly', () => {
    const tree = shallow(
      <Slider
        refine={() => undefined}
        min={0}
        max={500}
        values={{ min: 0, max: 0 }}
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
        values={{ min: 0, max: 0 }}
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
        values={{ min: 0, max: 0 }}
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

  it('renders BEM modifier classes on the handles and large markers', () => {
    const container = document.createElement('div');

    render(
      <Slider
        refine={() => undefined}
        min={0}
        max={5000}
        values={{ min: 0, max: 5000 }}
        pips={true}
        tooltips={true}
        cssClasses={{
          root: 'root',
          disabledRoot: 'disabledRoot',
        }}
      />,
      container
    );

    expect(container.querySelector('.rheostat-handle--lower')).toHaveAttribute(
      'data-handle-key',
      '0'
    );
    expect(container.querySelector('.rheostat-handle--upper')).toHaveAttribute(
      'data-handle-key',
      '1'
    );

    const largeMarkers = container.querySelectorAll('.rheostat-marker--large');
    expect(largeMarkers).toHaveLength(3);
    expect(
      Array.from(largeMarkers).map((marker) => marker.textContent)
    ).toEqual(['0', '2,500', '5,000']);
    expect(
      container.querySelectorAll('.rheostat-marker-horizontal')
    ).toHaveLength(0);
  });

  it('expect to call handleChange on change', () => {
    const props: SliderProps = {
      refine: jest.fn(),
      min: 0,
      max: 500,
      values: { min: 0, max: 0 },
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
    expect(props.refine).toHaveBeenCalledWith({ min: 0, max: 100 });
  });
});
