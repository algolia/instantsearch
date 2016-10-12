'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Template = require('../Template.js');

var _Template2 = _interopRequireDefault(_Template);

var _utils = require('../../lib/utils.js');

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _cloneDeep = require('lodash/cloneDeep');

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CurrentRefinedValues = function (_React$Component) {
  _inherits(CurrentRefinedValues, _React$Component);

  function CurrentRefinedValues() {
    _classCallCheck(this, CurrentRefinedValues);

    return _possibleConstructorReturn(this, (CurrentRefinedValues.__proto__ || Object.getPrototypeOf(CurrentRefinedValues)).apply(this, arguments));
  }

  _createClass(CurrentRefinedValues, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return !(0, _isEqual2.default)(this.props.refinements, nextProps.refinements);
    }
  }, {
    key: '_clearAllElement',
    value: function _clearAllElement(position, requestedPosition) {
      if (requestedPosition !== position) {
        return undefined;
      }
      return _react2.default.createElement(
        'a',
        {
          className: this.props.cssClasses.clearAll,
          href: this.props.clearAllURL,
          onClick: handleClick(this.props.clearAllClick)
        },
        _react2.default.createElement(_Template2.default, _extends({ templateKey: 'clearAll' }, this.props.templateProps))
      );
    }
  }, {
    key: '_refinementElement',
    value: function _refinementElement(refinement, i) {
      var attribute = this.props.attributes[refinement.attributeName] || {};
      var templateData = getTemplateData(attribute, refinement, this.props.cssClasses);
      var customTemplateProps = getCustomTemplateProps(attribute);
      var key = refinement.attributeName + (refinement.operator ? refinement.operator : ':') + (refinement.exclude ? refinement.exclude : '') + refinement.name;
      return _react2.default.createElement(
        'div',
        {
          className: this.props.cssClasses.item,
          key: key
        },
        _react2.default.createElement(
          'a',
          {
            className: this.props.cssClasses.link,
            href: this.props.clearRefinementURLs[i],
            onClick: handleClick(this.props.clearRefinementClicks[i])
          },
          _react2.default.createElement(_Template2.default, _extends({ data: templateData, templateKey: 'item' }, this.props.templateProps, customTemplateProps))
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        this._clearAllElement('before', this.props.clearAllPosition),
        _react2.default.createElement(
          'div',
          { className: this.props.cssClasses.list },
          (0, _map2.default)(this.props.refinements, this._refinementElement.bind(this))
        ),
        this._clearAllElement('after', this.props.clearAllPosition)
      );
    }
  }]);

  return CurrentRefinedValues;
}(_react2.default.Component);

function getCustomTemplateProps(attribute) {
  var customTemplateProps = {};
  if (attribute.template !== undefined) {
    customTemplateProps.templates = {
      item: attribute.template
    };
  }
  if (attribute.transformData !== undefined) {
    customTemplateProps.transformData = attribute.transformData;
  }
  return customTemplateProps;
}

function getTemplateData(attribute, _refinement, cssClasses) {
  var templateData = (0, _cloneDeep2.default)(_refinement);

  templateData.cssClasses = cssClasses;
  if (attribute.label !== undefined) {
    templateData.label = attribute.label;
  }
  if (templateData.operator !== undefined) {
    templateData.displayOperator = templateData.operator;
    if (templateData.operator === '>=') {
      templateData.displayOperator = '&ge;';
    }
    if (templateData.operator === '<=') {
      templateData.displayOperator = '&le;';
    }
  }

  return templateData;
}

function handleClick(cb) {
  return function (e) {
    if ((0, _utils.isSpecialClick)(e)) {
      // do not alter the default browser behavior
      // if one special key is down
      return;
    }
    e.preventDefault();
    cb();
  };
}

CurrentRefinedValues.propTypes = {
  attributes: _react2.default.PropTypes.object,
  clearAllClick: _react2.default.PropTypes.func,
  clearAllPosition: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.bool]),
  clearAllURL: _react2.default.PropTypes.string,
  clearRefinementClicks: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.func),
  clearRefinementURLs: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.string),
  cssClasses: _react2.default.PropTypes.shape({
    clearAll: _react2.default.PropTypes.string,
    list: _react2.default.PropTypes.string,
    item: _react2.default.PropTypes.string,
    link: _react2.default.PropTypes.string,
    count: _react2.default.PropTypes.string
  }).isRequired,
  refinements: _react2.default.PropTypes.array,
  templateProps: _react2.default.PropTypes.object.isRequired
};

exports.default = CurrentRefinedValues;