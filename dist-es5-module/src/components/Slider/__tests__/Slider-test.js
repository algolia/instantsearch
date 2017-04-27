'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

var _Slider = require('../Slider');

var _Slider2 = _interopRequireDefault(_Slider);

var _reactNouislider = require('react-nouislider');

var _reactNouislider2 = _interopRequireDefault(_reactNouislider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */

_expect2.default.extend(_expectJsx2.default);

describe('Slider', function () {
  // to ensure the global.window is set

  var renderer = void 0;
  var props = void 0;

  beforeEach(function () {
    var createRenderer = _reactAddonsTestUtils2.default.createRenderer;

    renderer = createRenderer();

    props = {
      range: { min: 0, max: 5000 },
      format: { to: function to() {}, from: function from() {} }
    };
  });

  it('should render <NouiSlider {...props} />', function () {
    var out = render();
    (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(_reactNouislider2.default, {
      animate: false,
      behaviour: 'snap',
      connect: true,
      cssPrefix: 'ais-range-slider--',
      format: { to: function to() {}, from: function from() {} },
      onChange: function onChange() {},
      pips: {
        density: 3,
        mode: 'positions',
        stepped: true,
        values: [0, 50, 100]
      },
      range: props.range
    }));
  });

  it('should not render anything when ranges are equal', function () {
    props.range.min = props.range.max = 8;
    var out = render();
    (0, _expect2.default)(out).toEqual(null);
  });

  function render() {
    renderer.render(_react2.default.createElement(_Slider2.default, props));
    return renderer.getRenderOutput();
  }
});