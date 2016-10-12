'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Selector = function (_React$Component) {
  _inherits(Selector, _React$Component);

  function Selector() {
    _classCallCheck(this, Selector);

    return _possibleConstructorReturn(this, (Selector.__proto__ || Object.getPrototypeOf(Selector)).apply(this, arguments));
  }

  _createClass(Selector, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.handleChange = this.handleChange.bind(this);
    }
  }, {
    key: 'handleChange',
    value: function handleChange(event) {
      this.props.setValue(event.target.value);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props;
      var currentValue = _props.currentValue;
      var options = _props.options;


      return _react2.default.createElement(
        'select',
        {
          className: this.props.cssClasses.root,
          onChange: this.handleChange,
          value: currentValue
        },
        options.map(function (option) {
          return _react2.default.createElement(
            'option',
            {
              className: _this2.props.cssClasses.item,
              key: option.value,
              value: option.value },
            option.label
          );
        })
      );
    }
  }]);

  return Selector;
}(_react2.default.Component);

Selector.propTypes = {
  cssClasses: _react2.default.PropTypes.shape({
    root: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.string)]),
    item: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.string)])
  }),
  currentValue: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.number]).isRequired,
  options: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.shape({
    value: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.number]).isRequired,
    label: _react2.default.PropTypes.string.isRequired
  })).isRequired,
  setValue: _react2.default.PropTypes.func.isRequired
};

exports.default = Selector;