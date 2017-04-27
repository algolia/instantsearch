'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _TestComponent = require('./TestComponent');

var _TestComponent2 = _interopRequireDefault(_TestComponent);

var _autoHideContainer = require('../autoHideContainer');

var _autoHideContainer2 = _interopRequireDefault(_autoHideContainer);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */

_expect2.default.extend(_expectJsx2.default);

describe('autoHideContainer', function () {
  var props = {};

  it('should render autoHideContainer(<TestComponent />)', function () {
    var createRenderer = _reactAddonsTestUtils2.default.createRenderer;

    var renderer = createRenderer();
    props.hello = 'son';
    var AutoHide = (0, _autoHideContainer2.default)(_TestComponent2.default);
    renderer.render(_react2.default.createElement(AutoHide, props));
    var out = renderer.getRenderOutput();
    (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(_TestComponent2.default, { hello: 'son' }));
  });

  context('props.shouldAutoHideContainer', function () {
    var AutoHide = void 0;
    var component = void 0;
    var container = void 0;

    beforeEach(function () {
      AutoHide = (0, _autoHideContainer2.default)(_TestComponent2.default);
      container = document.createElement('div');
      props = { hello: 'mom' };
      component = _reactDom2.default.render(_react2.default.createElement(AutoHide, props), container);
    });

    it('creates a component', function () {
      return (0, _expect2.default)(component).toExist();
    });

    it('shows the container at first', function () {
      (0, _expect2.default)(container.style.display).toNotEqual('none');
    });

    context('when set to true', function () {
      beforeEach(function () {
        _sinon2.default.spy(component, 'render');
        props.shouldAutoHideContainer = true;
        _reactDom2.default.render(_react2.default.createElement(AutoHide, props), container);
      });

      it('hides the container', function () {
        (0, _expect2.default)(container.style.display).toEqual('none');
      });

      it('does not call component.render()', function () {
        (0, _expect2.default)(component.render.called).toBe(false);
      });

      context('when set back to false', function () {
        beforeEach(function () {
          props.shouldAutoHideContainer = false;
          _reactDom2.default.render(_react2.default.createElement(AutoHide, props), container);
        });

        it('shows the container', function () {
          (0, _expect2.default)(container.style.display).toNotEqual('none');
        });

        it('calls component.render()', function () {
          (0, _expect2.default)(component.render.calledOnce).toBe(true);
        });
      });
    });
  });
});