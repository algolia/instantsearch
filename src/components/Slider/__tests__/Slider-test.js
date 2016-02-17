/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import jsdom from 'jsdom-global';
import TestUtils from 'react-addons-test-utils';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('Slider', () => {
  beforeEach(function() {this.jsdom = jsdom();});
  afterEach(function() {this.jsdom();}); // to ensure the global.window is set

  let renderer;
  let Slider;
  let Nouislider;
  let props;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();

    // need to be required AFTER jsdom has initialized global.window/navigator
    Slider = require('../Slider.js');
    Nouislider = require('react-nouislider');
    props = {
      range: {min: 0, max: 5000}
    };
  });


  it('should render <NouiSlider {...props} />', () => {
    let out = render();
    expect(out).toEqualJSX(
      <Nouislider
        animate={false}
        behaviour="snap"
        connect
        cssPrefix="ais-range-slider--"
        onChange={() => {}}
        pips={{density: 3, format: {to: function noRefCheck() {}}, mode: 'positions', stepped: true, values: [0, 50, 100]}}
        range={props.range}
      />
    );
  });

  it('should not render anything when ranges are equal', () => {
    props.range.min = props.range.max = 8;
    let out = render();
    expect(out).toEqual(null);
  });

  function render() {
    renderer.render(<Slider {...props} />);
    return renderer.getRenderOutput();
  }
});
