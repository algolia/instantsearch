'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _Selector = require('../Selector');

var _Selector2 = _interopRequireDefault(_Selector);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default); /* eslint-env mocha */

describe('Selector', function () {
  var renderer = void 0;

  beforeEach(function () {
    var createRenderer = _reactAddonsTestUtils2.default.createRenderer;

    renderer = createRenderer();
  });

  it('should render <Selector/> with strings', function () {
    var out = render({
      currentValue: 'index-a',
      cssClasses: {
        root: 'custom-root',
        item: 'custom-item'
      },
      options: [{ value: 'index-a', label: 'Index A' }, { value: 'index-b', label: 'Index B' }]
    });
    (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(
      'select',
      {
        className: 'custom-root',
        value: 'index-a',
        onChange: function onChange() {}
      },
      _react2.default.createElement(
        'option',
        { className: 'custom-item', value: 'index-a' },
        'Index A'
      ),
      _react2.default.createElement(
        'option',
        { className: 'custom-item', value: 'index-b' },
        'Index B'
      )
    ));
  });

  it('should render <Selector/> with numbers', function () {
    var out = render({
      currentValue: 10,
      cssClasses: {
        root: 'custom-root',
        item: 'custom-item'
      },
      options: [{ value: 10, label: '10 results per page' }, { value: 20, label: '20 results per page' }]
    });
    (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(
      'select',
      {
        className: 'custom-root',
        value: 10,
        onChange: function onChange() {}
      },
      _react2.default.createElement(
        'option',
        { className: 'custom-item', value: 10 },
        '10 results per page'
      ),
      _react2.default.createElement(
        'option',
        { className: 'custom-item', value: 20 },
        '20 results per page'
      )
    ));
  });

  function render() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    renderer.render(_react2.default.createElement(_Selector2.default, props));
    return renderer.getRenderOutput();
  }
});