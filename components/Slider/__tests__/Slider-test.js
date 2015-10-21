/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import jsdom from 'mocha-jsdom';
import TestUtils from 'react-addons-test-utils';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('Slider', () => {
  jsdom({useEach: true}); // to ensure the global.window is set

  var renderer;
  var Slider;
  var Nouislider;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();

    // need to be required AFTER jsdom has initialized global.window/navigator
    Slider = require('../Slider');
    Nouislider = require('react-nouislider');
  });


  it('should render <NouiSlider {...props} />', () => {
    var out = render();
    expect(out).toEqualJSX(
      <div>
        <Nouislider
          animate={false}
          behaviour="snap"
          connect={true}
          cssClasses={{}}
          cssPrefix="ais-range-slider--"
          onChange={() => {}}
          templateProps={{}}
        />
      </div>
    );
  });

  function render() {
    renderer.render(<Slider cssClasses={{}} templateProps={{}} />);
    return renderer.getRenderOutput();
  }
});
