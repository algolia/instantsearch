'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Issue with eslint + high-order components like decorators
/* eslint react/prop-types: 0 */

function autoHideContainer(ComposedComponent) {
  var AutoHide = function (_React$Component) {
    _inherits(AutoHide, _React$Component);

    function AutoHide() {
      _classCallCheck(this, AutoHide);

      return _possibleConstructorReturn(this, (AutoHide.__proto__ || Object.getPrototypeOf(AutoHide)).apply(this, arguments));
    }

    _createClass(AutoHide, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        this._hideOrShowContainer(this.props);
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        if (this.props.shouldAutoHideContainer === nextProps.shouldAutoHideContainer) {
          return;
        }

        this._hideOrShowContainer(nextProps);
      }
    }, {
      key: 'shouldComponentUpdate',
      value: function shouldComponentUpdate(nextProps) {
        return nextProps.shouldAutoHideContainer === false;
      }
    }, {
      key: '_hideOrShowContainer',
      value: function _hideOrShowContainer(props) {
        var container = _reactDom2.default.findDOMNode(this).parentNode;
        container.style.display = props.shouldAutoHideContainer === true ? 'none' : '';
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(ComposedComponent, this.props);
      }
    }]);

    return AutoHide;
  }(_react2.default.Component);

  AutoHide.propTypes = {
    shouldAutoHideContainer: _react2.default.PropTypes.bool.isRequired
  };

  // precise displayName for ease of debugging (react dev tool, react warnings)
  AutoHide.displayName = ComposedComponent.name + '-AutoHide';

  return AutoHide;
}

exports.default = autoHideContainer;