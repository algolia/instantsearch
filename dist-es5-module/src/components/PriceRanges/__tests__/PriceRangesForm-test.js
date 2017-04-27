'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env mocha */

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

var _PriceRangesForm = require('../PriceRangesForm');

var _PriceRangesForm2 = _interopRequireDefault(_PriceRangesForm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);

describe('PriceRangesForm', function () {
  var renderer = void 0;
  beforeEach(function () {
    var createRenderer = _reactAddonsTestUtils2.default.createRenderer;

    renderer = createRenderer();
  });

  function render() {
    var extraProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var props = _extends({}, extraProps);
    renderer.render(_react2.default.createElement(_PriceRangesForm2.default, props));
    return renderer.getRenderOutput();
  }

  context('display', function () {
    it('should pass all css classes and labels', function () {
      var out = render({
        labels: {
          currency: '$',
          separator: 'to',
          button: 'Go'
        },
        cssClasses: {
          form: 'form',
          label: 'label',
          input: 'input',
          currency: 'currency',
          separator: 'separator',
          button: 'button'
        },
        currentRefinement: {
          from: 10,
          to: 20
        }
      });
      (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(
        'form',
        { className: 'form', onSubmit: function onSubmit() {}, ref: 'form' },
        _react2.default.createElement(
          'label',
          { className: 'label' },
          _react2.default.createElement(
            'span',
            { className: 'currency' },
            '$ '
          ),
          _react2.default.createElement('input', { className: 'input', onChange: function onChange() {}, ref: 'from', type: 'number', value: 10 })
        ),
        _react2.default.createElement(
          'span',
          { className: 'separator' },
          ' to '
        ),
        _react2.default.createElement(
          'label',
          { className: 'label' },
          _react2.default.createElement(
            'span',
            { className: 'currency' },
            '$ '
          ),
          _react2.default.createElement('input', { className: 'input', onChange: function onChange() {}, ref: 'to', type: 'number', value: 20 })
        ),
        _react2.default.createElement(
          'button',
          { className: 'button', type: 'submit' },
          'Go'
        )
      ));
    });
  });

  context('submit', function () {
    it('starts a refine on submit', function () {
      // Given
      var refine = _sinon2.default.spy();
      var handleSubmitMock = _sinon2.default.spy(_PriceRangesForm2.default.prototype, 'handleSubmit');
      var component = _reactAddonsTestUtils2.default.renderIntoDocument(_react2.default.createElement(_PriceRangesForm2.default, {
        currentRefinement: {
          from: 10,
          to: 20
        },
        refine: refine
      }));

      // When
      component.refs.from.value = 10;
      _reactAddonsTestUtils2.default.Simulate.change(component.refs.from);
      component.refs.to.value = 20;
      _reactAddonsTestUtils2.default.Simulate.change(component.refs.to);
      _reactAddonsTestUtils2.default.Simulate.submit(component.refs.form);

      // Then
      (0, _expect2.default)(handleSubmitMock.calledOnce).toBe(true);
      (0, _expect2.default)(refine.calledWith(10, 20)).toBe(true);
    });
  });
});