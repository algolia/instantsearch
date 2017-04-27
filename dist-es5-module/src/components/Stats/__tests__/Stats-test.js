'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env mocha */

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _Stats = require('../Stats');

var _Stats2 = _interopRequireDefault(_Stats);

var _Template = require('../../Template');

var _Template2 = _interopRequireDefault(_Template);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);

describe('Stats', function () {
  var renderer = void 0;

  beforeEach(function () {
    var createRenderer = _reactAddonsTestUtils2.default.createRenderer;

    renderer = createRenderer();
  });

  it('should render <Template data= />', function () {
    var out = render();
    var defaultProps = {
      cssClasses: {},
      hasManyResults: true,
      hasNoResults: false,
      hasOneResult: false
    };
    (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(_Template2.default, {
      data: getProps(defaultProps),
      templateKey: 'body'
    }));
  });

  function render() {
    var extraProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var props = getProps(extraProps);
    renderer.render(_react2.default.createElement(_Stats2.default, _extends({}, props, { templateProps: {} })));
    return renderer.getRenderOutput();
  }

  function getProps() {
    var extraProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return _extends({
      cssClasses: {},
      hitsPerPage: 10,
      nbHits: 1234,
      nbPages: 124,
      page: 0,
      processingTimeMS: 42,
      query: 'a query'
    }, extraProps);
  }
});