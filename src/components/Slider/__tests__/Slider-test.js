/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import jsdom from 'mocha-jsdom';
import TestUtils from 'react-addons-test-utils';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('Slider', () => {
  jsdom({useEach: true}); // to ensure the global.window is set

  let renderer;
  let Slider;
  let Nouislider;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();

    // need to be required AFTER jsdom has initialized global.window/navigator
    Slider = require('../Slider.js');
    Nouislider = require('react-nouislider');
  });


  it('should render <NouiSlider {...props} />', () => {
    let out = render();
    expect(out).toEqualJSX(
      <Nouislider
        animate={false}
        behaviour="snap"
        connect
        cssClasses={{}}
        cssPrefix="ais-range-slider--"
        onChange={() => {}}
        pips={{density: 3, format: {to: function noRefCheck() {}}, mode: 'positions', stepped: true, values: [0, 50, 100]}}
        templateProps={{}}
      />
    );
  });

  function render() {
    renderer.render(<Slider cssClasses={{}} templateProps={{}} />);
    return renderer.getRenderOutput();
  }
});
