'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _curry = require('lodash/curry');

var _curry2 = _interopRequireDefault(_curry);

var _cloneDeep = require('lodash/cloneDeep');

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _mapValues = require('lodash/mapValues');

var _mapValues2 = _interopRequireDefault(_mapValues);

var _hogan = require('hogan.js');

var _hogan2 = _interopRequireDefault(_hogan);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Template = function (_React$Component) {
  _inherits(Template, _React$Component);

  function Template() {
    _classCallCheck(this, Template);

    return _possibleConstructorReturn(this, (Template.__proto__ || Object.getPrototypeOf(Template)).apply(this, arguments));
  }

  _createClass(Template, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return !(0, _isEqual2.default)(this.props.data, nextProps.data) || this.props.templateKey !== nextProps.templateKey;
    }
  }, {
    key: 'render',
    value: function render() {
      var useCustomCompileOptions = this.props.useCustomCompileOptions[this.props.templateKey];
      var compileOptions = useCustomCompileOptions ? this.props.templatesConfig.compileOptions : {};

      var content = renderTemplate({
        templates: this.props.templates,
        templateKey: this.props.templateKey,
        compileOptions: compileOptions,
        helpers: this.props.templatesConfig.helpers,
        data: transformData(this.props.transformData, this.props.templateKey, this.props.data)
      });

      if (content === null) {
        // Adds a noscript to the DOM but virtual DOM is null
        // See http://facebook.github.io/react/docs/component-specs.html#render
        return null;
      }

      if (_react2.default.isValidElement(content)) {
        return _react2.default.createElement(
          'div',
          this.props.rootProps,
          content
        );
      }

      return _react2.default.createElement('div', _extends({}, this.props.rootProps, { dangerouslySetInnerHTML: { __html: content } }));
    }
  }]);

  return Template;
}(_react2.default.Component);

Template.propTypes = {
  data: _react2.default.PropTypes.object,
  rootProps: _react2.default.PropTypes.object,
  templateKey: _react2.default.PropTypes.string,
  templates: _react2.default.PropTypes.objectOf(_react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.func])),
  templatesConfig: _react2.default.PropTypes.shape({
    helpers: _react2.default.PropTypes.objectOf(_react2.default.PropTypes.func),
    // https://github.com/twitter/hogan.js/#compilation-options
    compileOptions: _react2.default.PropTypes.shape({
      asString: _react2.default.PropTypes.bool,
      sectionTags: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.shape({
        o: _react2.default.PropTypes.string,
        c: _react2.default.PropTypes.string
      })),
      delimiters: _react2.default.PropTypes.string,
      disableLambda: _react2.default.PropTypes.bool
    })
  }),
  transformData: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.func, _react2.default.PropTypes.objectOf(_react2.default.PropTypes.func)]),
  useCustomCompileOptions: _react2.default.PropTypes.objectOf(_react2.default.PropTypes.bool)
};

Template.defaultProps = {
  data: {},
  useCustomCompileOptions: {},
  templates: {},
  templatesConfig: {}
};

function transformData(fn, templateKey, originalData) {
  if (!fn) {
    return originalData;
  }

  var clonedData = (0, _cloneDeep2.default)(originalData);

  var data = void 0;
  var typeFn = typeof fn === 'undefined' ? 'undefined' : _typeof(fn);
  if (typeFn === 'function') {
    data = fn(clonedData);
  } else if (typeFn === 'object') {
    // ex: transformData: {hit, empty}
    if (fn[templateKey]) {
      data = fn[templateKey](clonedData);
    } else {
      // if the templateKey doesn't exist, just use the
      // original data
      data = originalData;
    }
  } else {
    throw new Error('transformData must be a function or an object, was ' + typeFn + ' (key : ' + templateKey + ')');
  }

  var dataType = typeof data === 'undefined' ? 'undefined' : _typeof(data);
  var expectedType = typeof originalData === 'undefined' ? 'undefined' : _typeof(originalData);
  if (dataType !== expectedType) {
    throw new Error('`transformData` must return a `' + expectedType + '`, got `' + dataType + '`.');
  }
  return data;
}

function renderTemplate(_ref) {
  var templates = _ref.templates;
  var templateKey = _ref.templateKey;
  var compileOptions = _ref.compileOptions;
  var helpers = _ref.helpers;
  var data = _ref.data;

  var template = templates[templateKey];
  var templateType = typeof template === 'undefined' ? 'undefined' : _typeof(template);
  var isTemplateString = templateType === 'string';
  var isTemplateFunction = templateType === 'function';

  if (!isTemplateString && !isTemplateFunction) {
    throw new Error('Template must be \'string\' or \'function\', was \'' + templateType + '\' (key: ' + templateKey + ')');
  } else if (isTemplateFunction) {
    return template(data);
  } else {
    var transformedHelpers = transformHelpersToHogan(helpers, compileOptions, data);
    var preparedData = _extends({}, data, { helpers: transformedHelpers });
    return _hogan2.default.compile(template, compileOptions).render(preparedData);
  }
}

// We add all our template helper methods to the template as lambdas. Note
// that lambdas in Mustache are supposed to accept a second argument of
// `render` to get the rendered value, not the literal `{{value}}`. But
// this is currently broken (see
// https://github.com/twitter/hogan.js/issues/222).
function transformHelpersToHogan(helpers, compileOptions, data) {
  return (0, _mapValues2.default)(helpers, function (method) {
    return (0, _curry2.default)(function (text) {
      var _this2 = this;

      var render = function render(value) {
        return _hogan2.default.compile(value, compileOptions).render(_this2);
      };
      return method.call(data, text, render);
    });
  });
}

exports.default = Template;