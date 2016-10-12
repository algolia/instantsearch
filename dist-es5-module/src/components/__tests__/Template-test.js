'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env mocha */

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _Template = require('../Template');

var _Template2 = _interopRequireDefault(_Template);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

_expect2.default.extend(_expectJsx2.default);

var createRenderer = _reactAddonsTestUtils2.default.createRenderer;


describe('Template', function () {
  var renderer = void 0;

  beforeEach(function () {
    renderer = createRenderer();
  });

  describe('without helpers', function () {
    it('supports templates as strings', function () {
      var props = getProps({
        templates: { test: 'it works with {{type}}' },
        data: { type: 'strings' }
      });

      renderer.render(_react2.default.createElement(_Template2.default, props));
      var out = renderer.getRenderOutput();

      var content = 'it works with strings';
      (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: content } }));
    });

    it('supports templates as functions returning a string', function () {
      var props = getProps({
        templates: { test: function test(templateData) {
            return 'it also works with ' + templateData.type;
          } },
        data: { type: 'functions' }
      });

      renderer.render(_react2.default.createElement(_Template2.default, props));
      var out = renderer.getRenderOutput();

      var content = 'it also works with functions';
      (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: content } }));
    });

    it('supports templates as functions returning a React element', function () {
      var props = getProps({
        templates: { test: function test(templateData) {
            return _react2.default.createElement(
              'p',
              null,
              'it also works with ',
              templateData.type
            );
          } },
        data: { type: 'functions' }
      });

      renderer.render(_react2.default.createElement(_Template2.default, props));
      var out = renderer.getRenderOutput();

      var content = 'it also works with functions';
      (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'p',
          null,
          content
        )
      ));
    });

    it('can configure compilation options', function () {
      var props = getProps({
        templates: { test: 'it configures compilation <%options%>' },
        data: { options: 'delimiters' },
        useCustomCompileOptions: { test: true },
        templatesConfig: { compileOptions: { delimiters: '<% %>' } }
      });

      renderer.render(_react2.default.createElement(_Template2.default, props));
      var out = renderer.getRenderOutput();

      var content = 'it configures compilation delimiters';
      (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: content } }));
    });
  });

  describe('using helpers', function () {
    it('call the relevant function', function () {
      var props = getProps({
        templates: { test: 'it supports {{#helpers.emphasis}}{{feature}}{{/helpers.emphasis}}' },
        data: { feature: 'helpers' },
        templatesConfig: { helpers: { emphasis: function emphasis(text, render) {
              return '<em>' + render(text) + '</em>';
            } } }
      });

      renderer.render(_react2.default.createElement(_Template2.default, props));
      var out = renderer.getRenderOutput();

      var content = 'it supports <em>helpers</em>';
      (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: content } }));
    });

    it('sets the function context (`this`) to the template `data`', function (done) {
      var data = { feature: 'helpers' };
      var props = getProps({
        templates: { test: 'it supports {{#helpers.emphasis}}{{feature}}{{/helpers.emphasis}}' },
        data: data,
        templatesConfig: {
          helpers: {
            emphasis: function emphasis() {
              // context will be different when using arrow function (lexical scope used)
              (0, _expect2.default)(this).toBe(data);
              done();
            }
          }
        }
      });

      renderer.render(_react2.default.createElement(_Template2.default, props));
    });
  });

  describe('transform data usage', function () {
    it('supports passing a transformData map function', function () {
      var props = getProps({
        templates: { test: 'it supports {{feature}}' },
        data: { feature: 'replace me' },
        transformData: function transformData(originalData) {
          originalData.feature = 'transformData';
          return originalData;
        }
      });

      renderer.render(_react2.default.createElement(_Template2.default, props));

      var out = renderer.getRenderOutput();
      var content = 'it supports transformData';
      var expectedJSX = _react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: content } });

      (0, _expect2.default)(out).toEqualJSX(expectedJSX);
    });

    it('transformData with a function is using a deep cloned version of the data', function () {
      var called = false;
      var data = { a: {} };
      var props = getProps({
        templates: { test: '' },
        data: data,
        transformData: function transformData(clonedData) {
          called = true;
          (0, _expect2.default)(clonedData).toNotBe(data);
          (0, _expect2.default)(clonedData.a).toNotBe(data.a);
          (0, _expect2.default)(clonedData).toEqual(data);
          return clonedData;
        }
      });

      renderer.render(_react2.default.createElement(_Template2.default, props));
      (0, _expect2.default)(called).toBe(true);
    });

    it('transformData with an object is using a deep cloned version of the data', function () {
      var called = false;
      var data = { a: {} };
      var props = getProps({
        templates: { test: '' },
        data: data,
        transformData: {
          test: function test(clonedData) {
            called = true;
            (0, _expect2.default)(clonedData).toNotBe(data);
            (0, _expect2.default)(clonedData.a).toNotBe(data.a);
            (0, _expect2.default)(clonedData).toEqual(data);
            return clonedData;
          }
        }
      });

      renderer.render(_react2.default.createElement(_Template2.default, props));
      (0, _expect2.default)(called).toBe(true);
    });

    it('throws an error if the transformData is not returning anything', function () {
      var props = getProps({
        templates: { test: 'it supports {{feature}}' },
        data: { feature: 'replace me' },
        transformData: function transformData() {/* missing return value */}
      });

      (0, _expect2.default)(function () {
        renderer.render(_react2.default.createElement(_Template2.default, props));
      }).toThrow('`transformData` must return a `object`, got `undefined`.');
    });

    it('does not throw an error if the transformData is an object without the templateKey', function () {
      var props = getProps({
        templates: { test: 'it supports {{feature}}' },
        data: { feature: 'replace me' },
        transformData: {
          anotherKey: function anotherKey(d) {
            return d;
          }
        }
      });

      (0, _expect2.default)(function () {
        renderer.render(_react2.default.createElement(_Template2.default, props));
      }).toNotThrow();
    });

    it('throws an error if the transformData returns an unexpected type', function () {
      var props = getProps({
        templates: { test: 'it supports {{feature}}' },
        data: { feature: 'replace me' },
        transformData: function transformData() {
          return true;
        }
      });

      (0, _expect2.default)(function () {
        renderer.render(_react2.default.createElement(_Template2.default, props));
      }).toThrow('`transformData` must return a `object`, got `boolean`.');
    });
  });

  it('forward rootProps to the first node', function () {
    function fn() {}

    var props = getProps({});
    renderer.render(_react2.default.createElement(_Template2.default, _extends({ rootProps: { className: 'hey', onClick: fn } }, props)));

    var out = renderer.getRenderOutput();
    var expectedProps = {
      className: 'hey',
      dangerouslySetInnerHTML: { __html: '' },
      onClick: fn
    };
    (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement('div', expectedProps));
  });

  context('shouldComponentUpdate', function () {
    var props = void 0;
    var component = void 0;
    var container = void 0;

    beforeEach(function () {
      container = document.createElement('div');
      props = getProps({
        data: { hello: 'mom' }
      });
      component = _reactDom2.default.render(_react2.default.createElement(_Template2.default, props), container);
      _sinon2.default.spy(component, 'render');
    });

    it('does not call render when no change in data', function () {
      _reactDom2.default.render(_react2.default.createElement(_Template2.default, props), container);
      (0, _expect2.default)(component.render.called).toBe(false);
    });

    it('calls render when data changes', function () {
      props.data = { hello: 'dad' };
      _reactDom2.default.render(_react2.default.createElement(_Template2.default, props), container);
      (0, _expect2.default)(component.render.called).toBe(true);
    });

    it('calls render when templateKey changes', function () {
      props.templateKey += '-rerender';
      props.templates = _defineProperty({}, props.templateKey, '');
      _reactDom2.default.render(_react2.default.createElement(_Template2.default, props), container);
      (0, _expect2.default)(component.render.called).toBe(true);
    });
  });

  function getProps(_ref) {
    var _ref$templates = _ref.templates;
    var templates = _ref$templates === undefined ? { test: '' } : _ref$templates;
    var _ref$data = _ref.data;
    var data = _ref$data === undefined ? {} : _ref$data;
    var _ref$templateKey = _ref.templateKey;
    var templateKey = _ref$templateKey === undefined ? 'test' : _ref$templateKey;
    var _ref$useCustomCompile = _ref.useCustomCompileOptions;
    var useCustomCompileOptions = _ref$useCustomCompile === undefined ? {} : _ref$useCustomCompile;
    var _ref$templatesConfig = _ref.templatesConfig;
    var templatesConfig = _ref$templatesConfig === undefined ? { helper: {}, compileOptions: {} } : _ref$templatesConfig;
    var _ref$transformData = _ref.transformData;
    var transformData = _ref$transformData === undefined ? null : _ref$transformData;

    return { templates: templates, data: data, templateKey: templateKey, useCustomCompileOptions: useCustomCompileOptions, templatesConfig: templatesConfig, transformData: transformData };
  }
});