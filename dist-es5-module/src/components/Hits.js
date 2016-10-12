'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _Template = require('./Template.js');

var _Template2 = _interopRequireDefault(_Template);

var _has = require('lodash/has');

var _has2 = _interopRequireDefault(_has);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Hits = function (_React$Component) {
  _inherits(Hits, _React$Component);

  function Hits() {
    _classCallCheck(this, Hits);

    return _possibleConstructorReturn(this, (Hits.__proto__ || Object.getPrototypeOf(Hits)).apply(this, arguments));
  }

  _createClass(Hits, [{
    key: 'renderWithResults',
    value: function renderWithResults() {
      var _this2 = this;

      var renderedHits = (0, _map2.default)(this.props.results.hits, function (hit, position) {
        var data = _extends({}, hit, {
          __hitIndex: position
        });
        return _react2.default.createElement(_Template2.default, _extends({
          data: data,
          key: data.objectID,
          rootProps: { className: _this2.props.cssClasses.item },
          templateKey: 'item'
        }, _this2.props.templateProps));
      });

      return _react2.default.createElement(
        'div',
        { className: this.props.cssClasses.root },
        renderedHits
      );
    }
  }, {
    key: 'renderAllResults',
    value: function renderAllResults() {
      var className = (0, _classnames2.default)(this.props.cssClasses.root, this.props.cssClasses.allItems);

      return _react2.default.createElement(_Template2.default, _extends({
        data: this.props.results,
        rootProps: { className: className },
        templateKey: 'allItems'
      }, this.props.templateProps));
    }
  }, {
    key: 'renderNoResults',
    value: function renderNoResults() {
      var className = (0, _classnames2.default)(this.props.cssClasses.root, this.props.cssClasses.empty);
      return _react2.default.createElement(_Template2.default, _extends({
        data: this.props.results,
        rootProps: { className: className },
        templateKey: 'empty'
      }, this.props.templateProps));
    }
  }, {
    key: 'render',
    value: function render() {
      var hasResults = this.props.results.hits.length > 0;
      var hasAllItemsTemplate = (0, _has2.default)(this.props, 'templateProps.templates.allItems');

      if (!hasResults) {
        return this.renderNoResults();
      }

      // If a allItems template is defined, it takes precedence over our looping
      // through hits
      if (hasAllItemsTemplate) {
        return this.renderAllResults();
      }

      return this.renderWithResults();
    }
  }]);

  return Hits;
}(_react2.default.Component);

Hits.propTypes = {
  cssClasses: _react2.default.PropTypes.shape({
    root: _react2.default.PropTypes.string,
    item: _react2.default.PropTypes.string,
    allItems: _react2.default.PropTypes.string,
    empty: _react2.default.PropTypes.string
  }),
  results: _react2.default.PropTypes.object,
  templateProps: _react2.default.PropTypes.object.isRequired
};

Hits.defaultProps = {
  results: { hits: [] }
};

exports.default = Hits;