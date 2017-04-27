'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PaginationLink = function (_React$Component) {
  _inherits(PaginationLink, _React$Component);

  function PaginationLink() {
    _classCallCheck(this, PaginationLink);

    return _possibleConstructorReturn(this, (PaginationLink.__proto__ || Object.getPrototypeOf(PaginationLink)).apply(this, arguments));
  }

  _createClass(PaginationLink, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.handleClick = this.handleClick.bind(this);
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return !(0, _isEqual2.default)(this.props, nextProps);
    }
  }, {
    key: 'handleClick',
    value: function handleClick(e) {
      this.props.handleClick(this.props.pageNumber, e);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var cssClasses = _props.cssClasses;
      var label = _props.label;
      var ariaLabel = _props.ariaLabel;
      var url = _props.url;
      var isDisabled = _props.isDisabled;


      var tagName = 'span';
      var attributes = {
        className: cssClasses.link,
        dangerouslySetInnerHTML: {
          __html: label
        }
      };

      // "Enable" the element, by making it a link
      if (!isDisabled) {
        tagName = 'a';
        attributes = _extends({}, attributes, {
          'aria-label': ariaLabel,
          'href': url,
          'onClick': this.handleClick
        });
      }

      var element = _react2.default.createElement(tagName, attributes);

      return _react2.default.createElement(
        'li',
        { className: cssClasses.item },
        element
      );
    }
  }]);

  return PaginationLink;
}(_react2.default.Component);

PaginationLink.propTypes = {
  ariaLabel: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.number]).isRequired,
  cssClasses: _react2.default.PropTypes.shape({
    item: _react2.default.PropTypes.string,
    link: _react2.default.PropTypes.string
  }),
  handleClick: _react2.default.PropTypes.func.isRequired,
  isDisabled: _react2.default.PropTypes.bool,
  label: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.number]).isRequired,
  pageNumber: _react2.default.PropTypes.number,
  url: _react2.default.PropTypes.string
};

exports.default = PaginationLink;