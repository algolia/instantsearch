'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env mocha */

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _enzyme = require('enzyme');

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _TestComponent = require('./TestComponent');

var _TestComponent2 = _interopRequireDefault(_TestComponent);

var _headerFooter = require('../headerFooter');

var _headerFooter2 = _interopRequireDefault(_headerFooter);

var _Template = require('../../components/Template');

var _Template2 = _interopRequireDefault(_Template);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);

describe('headerFooter', function () {
  var renderer = void 0;
  var defaultProps = void 0;

  function render() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var HeaderFooter = (0, _headerFooter2.default)(_TestComponent2.default);
    renderer.render(_react2.default.createElement(HeaderFooter, props));
    return renderer.getRenderOutput();
  }

  function shallowRender() {
    var extraProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var props = _extends({
      templateProps: {}
    }, extraProps);
    var componentWrappedInHeaderFooter = (0, _headerFooter2.default)(_TestComponent2.default);
    return (0, _enzyme.shallow)(_react2.default.createElement(componentWrappedInHeaderFooter, props));
  }

  beforeEach(function () {
    var createRenderer = _reactAddonsTestUtils2.default.createRenderer;

    defaultProps = {
      cssClasses: {
        root: 'root',
        body: 'body'
      },
      collapsible: false,
      templateProps: {}
    };
    renderer = createRenderer();
  });

  it('should render the component in a root and body', function () {
    var out = render(defaultProps);
    (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(
      'div',
      { className: 'ais-root root' },
      _react2.default.createElement(
        'div',
        { className: 'ais-body body' },
        _react2.default.createElement(_TestComponent2.default, defaultProps)
      )
    ));
  });

  it('should add a header if such a template is passed', function () {
    // Given
    defaultProps.templateProps.templates = {
      header: 'HEADER'
    };
    // When
    var out = render(defaultProps);
    // Then
    var templateProps = {
      data: {},
      templateKey: 'header',
      transformData: null,
      templates: {
        header: 'HEADER'
      }
    };
    (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(
      'div',
      { className: 'ais-root root' },
      _react2.default.createElement(_Template2.default, _extends({ rootProps: { className: 'ais-header', onClick: null } }, templateProps)),
      _react2.default.createElement(
        'div',
        { className: 'ais-body body' },
        _react2.default.createElement(_TestComponent2.default, defaultProps)
      )
    ));
  });

  it('should add a footer if such a template is passed', function () {
    // Given
    defaultProps.templateProps.templates = {
      footer: 'FOOTER'
    };
    // When
    var out = render(defaultProps);
    // Then
    var templateProps = {
      data: {},
      templateKey: 'footer',
      transformData: null,
      templates: {
        footer: 'FOOTER'
      }
    };
    (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(
      'div',
      { className: 'ais-root root' },
      _react2.default.createElement(
        'div',
        { className: 'ais-body body' },
        _react2.default.createElement(_TestComponent2.default, defaultProps)
      ),
      _react2.default.createElement(_Template2.default, _extends({ rootProps: { className: 'ais-footer', onClick: null } }, templateProps))
    ));
  });

  describe('collapsible', function () {
    var templateProps = void 0;
    var headerTemplateProps = void 0;
    var footerTemplateProps = void 0;

    beforeEach(function () {
      defaultProps.templateProps.templates = {
        header: 'yo header',
        footer: 'yo footer'
      };
      templateProps = {
        data: {},
        transformData: null,
        templates: {
          header: 'yo header',
          footer: 'yo footer'
        }
      };
      headerTemplateProps = _extends({
        templateKey: 'header'
      }, templateProps);
      footerTemplateProps = _extends({
        templateKey: 'footer'
      }, templateProps);
    });

    it('when true', function () {
      defaultProps.collapsible = true;
      var out = render(defaultProps);
      (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(
        'div',
        { className: 'ais-root root ais-root__collapsible' },
        _react2.default.createElement(_Template2.default, _extends({ rootProps: { className: 'ais-header', onClick: function onClick() {}
          } }, headerTemplateProps)),
        _react2.default.createElement(
          'div',
          { className: 'ais-body body' },
          _react2.default.createElement(_TestComponent2.default, defaultProps)
        ),
        _react2.default.createElement(_Template2.default, _extends({ rootProps: { className: 'ais-footer', onClick: null } }, footerTemplateProps))
      ));
    });

    it('when collapsed', function () {
      defaultProps.collapsible = { collapsed: true };
      var out = render(defaultProps);
      (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(
        'div',
        { className: 'ais-root root ais-root__collapsible ais-root__collapsed' },
        _react2.default.createElement(_Template2.default, _extends({ rootProps: { className: 'ais-header', onClick: function onClick() {}
          } }, headerTemplateProps)),
        _react2.default.createElement(
          'div',
          { className: 'ais-body body' },
          _react2.default.createElement(_TestComponent2.default, defaultProps)
        ),
        _react2.default.createElement(_Template2.default, _extends({ rootProps: { className: 'ais-footer', onClick: null } }, footerTemplateProps))
      ));
    });
  });

  describe('headerFooterData', function () {
    it('should call the header and footer template with the given data', function () {
      // Given
      var props = {
        headerFooterData: {
          header: {
            foo: 'bar'
          },
          footer: {
            foo: 'baz'
          }
        },
        templateProps: {
          templates: {
            header: 'header',
            footer: 'footer'
          }
        }
      };

      // When
      var actual = shallowRender(props);
      var header = actual.find({ templateKey: 'header' });
      var footer = actual.find({ templateKey: 'footer' });

      // Then
      (0, _expect2.default)(header.props().data.foo).toEqual('bar');
      (0, _expect2.default)(footer.props().data.foo).toEqual('baz');
    });
  });
});