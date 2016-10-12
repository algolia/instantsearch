'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _Template = require('../components/Template.js');

var _Template2 = _interopRequireDefault(_Template);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Issue with eslint + high-order components like decorators
/* eslint react/prop-types: 0 */

function headerFooter(ComposedComponent) {
  var HeaderFooter = function (_React$Component) {
    _inherits(HeaderFooter, _React$Component);

    function HeaderFooter(props) {
      _classCallCheck(this, HeaderFooter);

      var _this = _possibleConstructorReturn(this, (HeaderFooter.__proto__ || Object.getPrototypeOf(HeaderFooter)).call(this, props));

      _this.handleHeaderClick = _this.handleHeaderClick.bind(_this);
      _this.state = {
        collapsed: props.collapsible && props.collapsible.collapsed
      };

      _this._cssClasses = {
        root: (0, _classnames2.default)('ais-root', _this.props.cssClasses.root),
        body: (0, _classnames2.default)('ais-body', _this.props.cssClasses.body)
      };

      _this._footerElement = _this._getElement({ type: 'footer' });
      return _this;
    }

    _createClass(HeaderFooter, [{
      key: '_getElement',
      value: function _getElement(_ref) {
        var type = _ref.type;
        var _ref$handleClick = _ref.handleClick;
        var handleClick = _ref$handleClick === undefined ? null : _ref$handleClick;

        var templates = this.props.templateProps.templates;
        if (!templates || !templates[type]) {
          return null;
        }
        var className = (0, _classnames2.default)(this.props.cssClasses[type], 'ais-' + type);

        var templateData = (0, _get2.default)(this.props, 'headerFooterData.' + type);

        return _react2.default.createElement(_Template2.default, _extends({}, this.props.templateProps, {
          data: templateData,
          rootProps: { className: className, onClick: handleClick },
          templateKey: type,
          transformData: null
        }));
      }
    }, {
      key: 'handleHeaderClick',
      value: function handleHeaderClick() {
        this.setState({
          collapsed: !this.state.collapsed
        });
      }
    }, {
      key: 'render',
      value: function render() {
        var rootCssClasses = [this._cssClasses.root];

        if (this.props.collapsible) {
          rootCssClasses.push('ais-root__collapsible');
        }

        if (this.state.collapsed) {
          rootCssClasses.push('ais-root__collapsed');
        }

        var cssClasses = _extends({}, this._cssClasses, {
          root: (0, _classnames2.default)(rootCssClasses)
        });

        var headerElement = this._getElement({
          type: 'header',
          handleClick: this.props.collapsible ? this.handleHeaderClick : null
        });

        return _react2.default.createElement(
          'div',
          { className: cssClasses.root },
          headerElement,
          _react2.default.createElement(
            'div',
            {
              className: cssClasses.body
            },
            _react2.default.createElement(ComposedComponent, this.props)
          ),
          this._footerElement
        );
      }
    }]);

    return HeaderFooter;
  }(_react2.default.Component);

  HeaderFooter.propTypes = {
    collapsible: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.bool, _react2.default.PropTypes.shape({
      collapsed: _react2.default.PropTypes.bool
    })]),
    cssClasses: _react2.default.PropTypes.shape({
      root: _react2.default.PropTypes.string,
      header: _react2.default.PropTypes.string,
      body: _react2.default.PropTypes.string,
      footer: _react2.default.PropTypes.string
    }),
    templateProps: _react2.default.PropTypes.object
  };

  HeaderFooter.defaultProps = {
    cssClasses: {},
    collapsible: false
  };

  // precise displayName for ease of debugging (react dev tool, react warnings)
  HeaderFooter.displayName = ComposedComponent.name + '-HeaderFooter';

  return HeaderFooter;
}

exports.default = headerFooter;