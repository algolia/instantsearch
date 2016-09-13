/* eslint-env mocha */

import React from 'react';
import expect from 'expect';

import TestUtils from 'react-addons-test-utils';

import expectJSX from 'expect-jsx';
import Slider from '../Slider';
import Nouislider from 'react-nouislider';
expect.extend(expectJSX);

describe('Slider', () => {
   // to ensure the global.window is set

  let renderer;
  let props;

  beforeEach(() => {
    const {createRenderer} = TestUtils;
    renderer = createRenderer();

    props = {
      range: {min: 0, max: 5000},
      format: {to: () => {}, from: () => {}}
    };
  });


  it('should render <NouiSlider {...props} />', () => {
    const out = render();
    expect(out).toEqualJSX(
      <Nouislider
        animate={false}
        behaviour="snap"
        connect
        cssPrefix="ais-range-slider--"
        format={{to: () => {}, from: () => {}}}
        onChange={() => {}}
        pips={{
          density: 3,
          mode: 'positions',
          stepped: true,
          values: [0, 50, 100]
        }}
        range={props.range}
      />
    );
  });

  it('should not render anything when ranges are equal', () => {
    props.range.min = props.range.max = 8;
    const out = render();
    expect(out).toEqual(null);
  });

  function render() {
    renderer.render(<Slider {...props} />);
    return renderer.getRenderOutput();
  }
});
