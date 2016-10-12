'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _defaults = require('lodash/defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _utils = require('../../lib/utils.js');

var _autoHideContainer = require('../../decorators/autoHideContainer.js');

var _autoHideContainer2 = _interopRequireDefault(_autoHideContainer);

var _Pagination = require('../../components/Pagination/Pagination.js');

var _Pagination2 = _interopRequireDefault(_Pagination);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultLabels = {
  previous: '‹',
  next: '›',
  first: '«',
  last: '»'
};
var bem = (0, _utils.bemHelper)('ais-pagination');

/**
 * Add a pagination menu to navigate through the results
 * @function pagination
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.labels] Text to display in the various links (prev, next, first, last)
 * @param  {string} [options.labels.previous] Label for the Previous link
 * @param  {string} [options.labels.next] Label for the Next link
 * @param  {string} [options.labels.first] Label for the First link
 * @param  {string} [options.labels.last] Label for the Last link
 * @param  {number} [options.maxPages] The max number of pages to browse
 * @param  {number} [options.padding=3] The number of pages to display on each side of the current page
 * @param  {string|DOMElement|boolean} [options.scrollTo='body'] Where to scroll after a click, set to `false` to disable
 * @param  {boolean} [options.showFirstLast=true] Define if the First and Last links should be displayed
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string|string[]} [options.cssClasses.root] CSS classes added to the parent `<ul>`
 * @param  {string|string[]} [options.cssClasses.item] CSS classes added to each `<li>`
 * @param  {string|string[]} [options.cssClasses.link] CSS classes added to each link
 * @param  {string|string[]} [options.cssClasses.page] CSS classes added to page `<li>`
 * @param  {string|string[]} [options.cssClasses.previous] CSS classes added to the previous `<li>`
 * @param  {string|string[]} [options.cssClasses.next] CSS classes added to the next `<li>`
 * @param  {string|string[]} [options.cssClasses.first] CSS classes added to the first `<li>`
 * @param  {string|string[]} [options.cssClasses.last] CSS classes added to the last `<li>`
 * @param  {string|string[]} [options.cssClasses.active] CSS classes added to the active `<li>`
 * @param  {string|string[]} [options.cssClasses.disabled] CSS classes added to the disabled `<li>`
 * @return {Object}
 */
var usage = 'Usage:\npagination({\n  container,\n  [ cssClasses.{root,item,page,previous,next,first,last,active,disabled}={} ],\n  [ labels.{previous,next,first,last} ],\n  [ maxPages ],\n  [ padding=3 ],\n  [ showFirstLast=true ],\n  [ autoHideContainer=true ],\n  [ scrollTo=\'body\' ]\n})';
function pagination() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var container = _ref.container;
  var _ref$cssClasses = _ref.cssClasses;
  var userCssClasses = _ref$cssClasses === undefined ? {} : _ref$cssClasses;
  var _ref$labels = _ref.labels;
  var userLabels = _ref$labels === undefined ? {} : _ref$labels;
  var maxPages = _ref.maxPages;
  var _ref$padding = _ref.padding;
  var padding = _ref$padding === undefined ? 3 : _ref$padding;
  var _ref$showFirstLast = _ref.showFirstLast;
  var showFirstLast = _ref$showFirstLast === undefined ? true : _ref$showFirstLast;
  var _ref$autoHideContaine = _ref.autoHideContainer;
  var autoHideContainer = _ref$autoHideContaine === undefined ? true : _ref$autoHideContaine;
  var _ref$scrollTo = _ref.scrollTo;
  var userScrollTo = _ref$scrollTo === undefined ? 'body' : _ref$scrollTo;

  var scrollTo = userScrollTo;

  if (!container) {
    throw new Error(usage);
  }

  if (scrollTo === true) {
    scrollTo = 'body';
  }

  var containerNode = (0, _utils.getContainerNode)(container);
  var scrollToNode = scrollTo !== false ? (0, _utils.getContainerNode)(scrollTo) : false;
  var Pagination = _Pagination2.default;
  if (autoHideContainer === true) {
    Pagination = (0, _autoHideContainer2.default)(Pagination);
  }

  var cssClasses = {
    root: (0, _classnames2.default)(bem(null), userCssClasses.root),
    item: (0, _classnames2.default)(bem('item'), userCssClasses.item),
    link: (0, _classnames2.default)(bem('link'), userCssClasses.link),
    page: (0, _classnames2.default)(bem('item', 'page'), userCssClasses.page),
    previous: (0, _classnames2.default)(bem('item', 'previous'), userCssClasses.previous),
    next: (0, _classnames2.default)(bem('item', 'next'), userCssClasses.next),
    first: (0, _classnames2.default)(bem('item', 'first'), userCssClasses.first),
    last: (0, _classnames2.default)(bem('item', 'last'), userCssClasses.last),
    active: (0, _classnames2.default)(bem('item', 'active'), userCssClasses.active),
    disabled: (0, _classnames2.default)(bem('item', 'disabled'), userCssClasses.disabled)
  };

  var labels = (0, _defaults2.default)(userLabels, defaultLabels);

  return {
    init: function init(_ref2) {
      var helper = _ref2.helper;

      this.setCurrentPage = function (page) {
        helper.setCurrentPage(page);
        if (scrollToNode !== false) {
          scrollToNode.scrollIntoView();
        }
        helper.search();
      };
    },
    getMaxPage: function getMaxPage(results) {
      if (maxPages !== undefined) {
        return Math.min(maxPages, results.nbPages);
      }
      return results.nbPages;
    },
    render: function render(_ref3) {
      var results = _ref3.results;
      var state = _ref3.state;
      var _createURL = _ref3.createURL;

      _reactDom2.default.render(_react2.default.createElement(Pagination, {
        createURL: function createURL(page) {
          return _createURL(state.setPage(page));
        },
        cssClasses: cssClasses,
        currentPage: results.page,
        labels: labels,
        nbHits: results.nbHits,
        nbPages: this.getMaxPage(results),
        padding: padding,
        setCurrentPage: this.setCurrentPage,
        shouldAutoHideContainer: results.nbHits === 0,
        showFirstLast: showFirstLast
      }), containerNode);
    }
  };
}

exports.default = pagination;