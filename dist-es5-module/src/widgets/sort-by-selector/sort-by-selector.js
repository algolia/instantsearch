'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _findIndex = require('lodash/findIndex');

var _findIndex2 = _interopRequireDefault(_findIndex);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _utils = require('../../lib/utils.js');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _autoHideContainer = require('../../decorators/autoHideContainer.js');

var _autoHideContainer2 = _interopRequireDefault(_autoHideContainer);

var _Selector = require('../../components/Selector.js');

var _Selector2 = _interopRequireDefault(_Selector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bem = (0, _utils.bemHelper)('ais-sort-by-selector');
/**
 * Instantiate a dropdown element to choose the current targeted index
 * @function sortBySelector
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array} options.indices Array of objects defining the different indices to choose from.
 * @param  {string} options.indices[0].name Name of the index to target
 * @param  {string} options.indices[0].label Label displayed in the dropdown
 * @param  {boolean} [options.autoHideContainer=false] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string|string[]} [options.cssClasses.root] CSS classes added to the parent <select>
 * @param  {string|string[]} [options.cssClasses.item] CSS classes added to each <option>
 * @return {Object}
 */
var usage = 'Usage:\nsortBySelector({\n  container,\n  indices,\n  [cssClasses.{root,item}={}],\n  [autoHideContainer=false]\n})';
function sortBySelector() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var container = _ref.container;
  var indices = _ref.indices;
  var _ref$cssClasses = _ref.cssClasses;
  var userCssClasses = _ref$cssClasses === undefined ? {} : _ref$cssClasses;
  var _ref$autoHideContaine = _ref.autoHideContainer;
  var autoHideContainer = _ref$autoHideContaine === undefined ? false : _ref$autoHideContaine;

  if (!container || !indices) {
    throw new Error(usage);
  }

  var containerNode = (0, _utils.getContainerNode)(container);
  var Selector = _Selector2.default;
  if (autoHideContainer === true) {
    Selector = (0, _autoHideContainer2.default)(Selector);
  }

  var selectorOptions = (0, _map2.default)(indices, function (index) {
    return { label: index.label, value: index.name };
  });

  var cssClasses = {
    root: (0, _classnames2.default)(bem(null), userCssClasses.root),
    item: (0, _classnames2.default)(bem('item'), userCssClasses.item)
  };

  return {
    init: function init(_ref2) {
      var helper = _ref2.helper;

      var currentIndex = helper.getIndex();
      var isIndexInList = (0, _findIndex2.default)(indices, { name: currentIndex }) !== -1;
      if (!isIndexInList) {
        throw new Error('[sortBySelector]: Index ' + currentIndex + ' not present in `indices`');
      }
      this.setIndex = function (indexName) {
        return helper.setIndex(indexName).search();
      };
    },
    render: function render(_ref3) {
      var helper = _ref3.helper;
      var results = _ref3.results;

      _reactDom2.default.render(_react2.default.createElement(Selector, {
        cssClasses: cssClasses,
        currentValue: helper.getIndex(),
        options: selectorOptions,
        setValue: this.setIndex,
        shouldAutoHideContainer: results.nbHits === 0
      }), containerNode);
    }
  };
}

exports.default = sortBySelector;