'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env mocha */

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _RefinementListItem = require('../RefinementListItem');

var _RefinementListItem2 = _interopRequireDefault(_RefinementListItem);

var _Template = require('../../Template');

var _Template2 = _interopRequireDefault(_Template);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);
describe('RefinementListItem', function () {
  var renderer = void 0;
  var props = void 0;

  beforeEach(function () {
    props = {
      facetValue: 'Hello',
      handleClick: _sinon2.default.spy(),
      itemClassName: 'item class',
      templateData: { template: 'data' },
      templateKey: 'item key',
      templateProps: { template: 'props' },
      subItems: _react2.default.createElement('div', null)
    };
    renderer = (0, _reactAddonsTestUtils.createRenderer)();
  });

  it('renders an item', function () {
    var out = render(props);

    (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(
      'div',
      {
        className: props.itemClassName,
        onClick: props.handleClick
      },
      _react2.default.createElement(_Template2.default, _extends({
        data: props.templateData,
        templateKey: props.templateKey
      }, props.templateProps)),
      props.subItems
    ));
  });

  it('calls the right function', function () {
    var out = render(props);
    out.props.onClick();
    (0, _expect2.default)(props.handleClick.calledOnce).toBe(true);
  });

  function render(askedProps) {
    renderer.render(_react2.default.createElement(_RefinementListItem2.default, askedProps));
    return renderer.getRenderOutput();
  }
});