'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _utils = require('../../lib/utils.js');

var _some = require('lodash/some');

var _some2 = _interopRequireDefault(_some);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _autoHideContainer = require('../../decorators/autoHideContainer.js');

var _autoHideContainer2 = _interopRequireDefault(_autoHideContainer);

var _Selector = require('../../components/Selector.js');

var _Selector2 = _interopRequireDefault(_Selector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bem = (0, _utils.bemHelper)('ais-hits-per-page-selector');

/**
 * Instantiate a dropdown element to choose the number of hits to display per page
 * @function hitsPerPageSelector
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array} options.options Array of objects defining the different values and labels
 * @param  {number} options.options[0].value number of hits to display per page
 * @param  {string} options.options[0].label Label to display in the option
 * @param  {boolean} [options.autoHideContainer=false] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string|string[]} [options.cssClasses.root] CSS classes added to the parent `<select>`
 * @param  {string|string[]} [options.cssClasses.item] CSS classes added to each `<option>`
 * @return {Object}
 */

var usage = 'Usage:\nhitsPerPageSelector({\n  container,\n  options,\n  [ cssClasses.{root,item}={} ],\n  [ autoHideContainer=false ]\n})';
function hitsPerPageSelector() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var container = _ref.container;
  var userOptions = _ref.options;
  var _ref$cssClasses = _ref.cssClasses;
  var userCssClasses = _ref$cssClasses === undefined ? {} : _ref$cssClasses;
  var _ref$autoHideContaine = _ref.autoHideContainer;
  var autoHideContainer = _ref$autoHideContaine === undefined ? false : _ref$autoHideContaine;

  var options = userOptions;

  if (!container || !options) {
    throw new Error(usage);
  }

  var containerNode = (0, _utils.getContainerNode)(container);
  var Selector = _Selector2.default;
  if (autoHideContainer === true) {
    Selector = (0, _autoHideContainer2.default)(Selector);
  }

  var cssClasses = {
    root: (0, _classnames2.default)(bem(null), userCssClasses.root),
    item: (0, _classnames2.default)(bem('item'), userCssClasses.item)
  };

  return {
    init: function init(_ref2) {
      var helper = _ref2.helper;
      var state = _ref2.state;

      var isCurrentInOptions = (0, _some2.default)(options, function (option) {
        return Number(state.hitsPerPage) === Number(option.value);
      });

      if (!isCurrentInOptions) {
        if (state.hitsPerPage === undefined) {
          if (window.console) {
            window.console.log('[Warning][hitsPerPageSelector] hitsPerPage not defined.\nYou should probably use a `hits` widget or set the value `hitsPerPage`\nusing the searchParameters attribute of the instantsearch constructor.');
          }
        } else if (window.console) {
          window.console.log('[Warning][hitsPerPageSelector] No option in `options`\nwith `value: hitsPerPage` (hitsPerPage: ' + state.hitsPerPage + ')');
        }

        options = [{ value: undefined, label: '' }].concat(options);
      }

      this.setHitsPerPage = function (value) {
        return helper.setQueryParameter('hitsPerPage', Number(value)).search();
      };
    },
    render: function render(_ref3) {
      var state = _ref3.state;
      var results = _ref3.results;

      var currentValue = state.hitsPerPage;
      var hasNoResults = results.nbHits === 0;

      _reactDom2.default.render(_react2.default.createElement(Selector, {
        cssClasses: cssClasses,
        currentValue: currentValue,
        options: options,
        setValue: this.setHitsPerPage,
        shouldAutoHideContainer: hasNoResults
      }), containerNode);
    }
  };
}

exports.default = hitsPerPageSelector;