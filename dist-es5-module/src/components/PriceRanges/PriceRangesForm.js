'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PriceRangesForm = function (_React$Component) {
  _inherits(PriceRangesForm, _React$Component);

  function PriceRangesForm(props) {
    _classCallCheck(this, PriceRangesForm);

    var _this = _possibleConstructorReturn(this, (PriceRangesForm.__proto__ || Object.getPrototypeOf(PriceRangesForm)).call(this, props));

    _this.state = {
      from: props.currentRefinement.from,
      to: props.currentRefinement.to
    };
    return _this;
  }

  _createClass(PriceRangesForm, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(props) {
      this.setState({
        from: props.currentRefinement.from,
        to: props.currentRefinement.to
      });
    }
  }, {
    key: 'getInput',
    value: function getInput(type) {
      var _this2 = this;

      return _react2.default.createElement(
        'label',
        { className: this.props.cssClasses.label },
        _react2.default.createElement(
          'span',
          { className: this.props.cssClasses.currency },
          this.props.labels.currency,
          ' '
        ),
        _react2.default.createElement('input', {
          className: this.props.cssClasses.input,
          onChange: function onChange(e) {
            return _this2.setState(_defineProperty({}, type, e.target.value));
          },
          ref: type,
          type: 'number',
          value: this.state[type]
        })
      );
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(event) {
      var from = this.refs.from.value !== '' ? parseInt(this.refs.from.value, 10) : undefined;
      var to = this.refs.to.value !== '' ? parseInt(this.refs.to.value, 10) : undefined;
      this.props.refine(from, to, event);
    }
  }, {
    key: 'render',
    value: function render() {
      var fromInput = this.getInput('from');
      var toInput = this.getInput('to');
      var onSubmit = this.handleSubmit;
      return _react2.default.createElement(
        'form',
        { className: this.props.cssClasses.form, onSubmit: onSubmit, ref: 'form' },
        fromInput,
        _react2.default.createElement(
          'span',
          { className: this.props.cssClasses.separator },
          ' ',
          this.props.labels.separator,
          ' '
        ),
        toInput,
        _react2.default.createElement(
          'button',
          { className: this.props.cssClasses.button, type: 'submit' },
          this.props.labels.button
        )
      );
    }
  }]);

  return PriceRangesForm;
}(_react2.default.Component);

PriceRangesForm.propTypes = {
  cssClasses: _react2.default.PropTypes.shape({
    button: _react2.default.PropTypes.string,
    currency: _react2.default.PropTypes.string,
    form: _react2.default.PropTypes.string,
    input: _react2.default.PropTypes.string,
    label: _react2.default.PropTypes.string,
    separator: _react2.default.PropTypes.string
  }),
  currentRefinement: _react2.default.PropTypes.shape({
    from: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.number]),
    to: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.number])
  }),
  labels: _react2.default.PropTypes.shape({
    button: _react2.default.PropTypes.string,
    currency: _react2.default.PropTypes.string,
    separator: _react2.default.PropTypes.string
  }),
  refine: _react2.default.PropTypes.func.isRequired
};

PriceRangesForm.defaultProps = {
  cssClasses: {},
  labels: {}
};

exports.default = PriceRangesForm;