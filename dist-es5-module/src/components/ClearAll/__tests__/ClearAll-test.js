'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env mocha */

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _ClearAll = require('../ClearAll');

var _ClearAll2 = _interopRequireDefault(_ClearAll);

var _Template = require('../../Template');

var _Template2 = _interopRequireDefault(_Template);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);

var createRenderer = _reactAddonsTestUtils2.default.createRenderer;


describe('ClearAll', function () {
  var renderer = void 0;
  var defaultProps = {
    clearAll: function clearAll() {},
    cssClasses: {
      link: 'custom-link'
    },
    hasRefinements: false,
    templateProps: {},
    url: '#all-cleared!'
  };

  beforeEach(function () {
    renderer = createRenderer();
  });

  it('should render <ClearAll />', function () {
    var out = render();
    (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(
      'a',
      {
        className: 'custom-link',
        href: '#all-cleared!',
        onClick: function onClick() {}
      },
      _react2.default.createElement(_Template2.default, {
        data: { hasRefinements: false },
        templateKey: 'link'
      })
    ));
  });

  it('should handle clicks (and special clicks)', function () {
    var props = {
      clearAll: _sinon2.default.spy()
    };
    var preventDefault = _sinon2.default.spy();
    var component = new _ClearAll2.default(props);
    ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].forEach(function (e) {
      var event = { preventDefault: preventDefault };
      event[e] = true;
      component.handleClick(event);
      (0, _expect2.default)(props.clearAll.called).toBe(false, 'clearAll never called');
      (0, _expect2.default)(preventDefault.called).toBe(false, 'preventDefault never called');
    });
    component.handleClick({ preventDefault: preventDefault });
    (0, _expect2.default)(props.clearAll.calledOnce).toBe(true, 'clearAll called once');
    (0, _expect2.default)(preventDefault.calledOnce).toBe(true, 'preventDefault called once');
  });

  function render() {
    var extraProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var props = _extends({}, defaultProps, extraProps);
    renderer.render(_react2.default.createElement(_ClearAll2.default, props));
    return renderer.getRenderOutput();
  }
});