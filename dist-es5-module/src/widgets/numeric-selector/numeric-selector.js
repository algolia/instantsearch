'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _utils = require('../../lib/utils.js');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _autoHideContainer = require('../../decorators/autoHideContainer.js');

var _autoHideContainer2 = _interopRequireDefault(_autoHideContainer);

var _Selector = require('../../components/Selector.js');

var _Selector2 = _interopRequireDefault(_Selector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var bem = (0, _utils.bemHelper)('ais-numeric-selector');

/**
 * Instantiate a dropdown element to choose the number of hits to display per page
 * @function numericSelector
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the numeric attribute to use
 * @param  {Array} options.options Array of objects defining the different values and labels
 * @param  {number} options.options[i].value The numerical value to refine with
 * @param  {string} options.options[i].label Label to display in the option
 * @param  {string} [options.operator] The operator to use to refine
 * @param  {boolean} [options.autoHideContainer=false] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string|string[]} [options.cssClasses.root] CSS classes added to the parent `<select>`
 * @param  {string|string[]} [options.cssClasses.item] CSS classes added to each `<option>`
 * @return {Object}
 */

function numericSelector(_ref) {
  var container = _ref.container;
  var _ref$operator = _ref.operator;
  var operator = _ref$operator === undefined ? '=' : _ref$operator;
  var attributeName = _ref.attributeName;
  var options = _ref.options;
  var _ref$cssClasses = _ref.cssClasses;
  var userCssClasses = _ref$cssClasses === undefined ? {} : _ref$cssClasses;
  var _ref$autoHideContaine = _ref.autoHideContainer;
  var autoHideContainer = _ref$autoHideContaine === undefined ? false : _ref$autoHideContaine;

  var containerNode = (0, _utils.getContainerNode)(container);
  var usage = 'Usage: numericSelector({\n    container,\n    attributeName,\n    options,\n    cssClasses.{root,item},\n    autoHideContainer\n  })';

  var Selector = _Selector2.default;
  if (autoHideContainer === true) {
    Selector = (0, _autoHideContainer2.default)(Selector);
  }

  if (!container || !options || options.length === 0 || !attributeName) {
    throw new Error(usage);
  }

  var cssClasses = {
    root: (0, _classnames2.default)(bem(null), userCssClasses.root),
    item: (0, _classnames2.default)(bem('item'), userCssClasses.item)
  };

  return {
    getConfiguration: function getConfiguration(currentSearchParameters, searchParametersFromUrl) {
      return {
        numericRefinements: _defineProperty({}, attributeName, _defineProperty({}, operator, [this._getRefinedValue(searchParametersFromUrl)]))
      };
    },
    init: function init(_ref2) {
      var helper = _ref2.helper;

      this._refine = function (value) {
        helper.clearRefinements(attributeName);
        if (value !== undefined) {
          helper.addNumericRefinement(attributeName, operator, value);
        }
        helper.search();
      };
    },
    render: function render(_ref3) {
      var helper = _ref3.helper;
      var results = _ref3.results;

      _reactDom2.default.render(_react2.default.createElement(Selector, {
        cssClasses: cssClasses,
        currentValue: this._getRefinedValue(helper.state),
        options: options,
        setValue: this._refine,
        shouldAutoHideContainer: results.nbHits === 0
      }), containerNode);
    },
    _getRefinedValue: function _getRefinedValue(state) {
      // This is reimplementing state.getNumericRefinement
      // But searchParametersFromUrl is not an actual SearchParameters object
      // It's only the object structure without the methods, because getStateFromQueryString
      // is not sending a SearchParameters. There's no way given how web built the helper
      // to initialize a true partial state where only the refinements are present
      return state && state.numericRefinements && state.numericRefinements[attributeName] !== undefined && state.numericRefinements[attributeName][operator] !== undefined && state.numericRefinements[attributeName][operator][0] !== undefined ? // could be 0
      state.numericRefinements[attributeName][operator][0] : options[0].value;
    }
  };
}

exports.default = numericSelector;