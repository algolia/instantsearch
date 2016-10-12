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

var _Hits = require('../../components/Hits.js');

var _Hits2 = _interopRequireDefault(_Hits);

var _defaultTemplates = require('./defaultTemplates.js');

var _defaultTemplates2 = _interopRequireDefault(_defaultTemplates);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bem = (0, _utils.bemHelper)('ais-hits');

/**
 * Display the list of results (hits) from the current search
 * @function hits
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.empty=''] Template to use when there are no results.
 * @param  {string|Function} [options.templates.item=''] Template to use for each result. This template will receive an object containing a single record.
 * @param  {string|Function} [options.templates.allItems=''] Template to use for the list of all results. (Can't be used with `item` template). This template will receive a complete SearchResults result object, this object contains the key hits that contains all the records retrieved.
 * @param  {Object} [options.transformData] Method to change the object passed to the templates
 * @param  {Function} [options.transformData.empty] Method used to change the object passed to the `empty` template
 * @param  {Function} [options.transformData.item] Method used to change the object passed to the `item` template
 * @param  {Function} [options.transformData.allItems] Method used to change the object passed to the `allItems` template
 * @param  {number} [hitsPerPage=20] The number of hits to display per page
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the wrapping element
 * @param  {string|string[]} [options.cssClasses.empty] CSS class to add to the wrapping element when no results
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each result
 * @return {Object}
 */
var usage = '\nUsage:\nhits({\n  container,\n  [ cssClasses.{root,empty,item}={} ],\n  [ templates.{empty,item} | templates.{empty, allItems} ],\n  [ transformData.{empty,item} | transformData.{empty, allItems} ],\n  [ hitsPerPage=20 ]\n})';
function hits() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var container = _ref.container;
  var _ref$cssClasses = _ref.cssClasses;
  var userCssClasses = _ref$cssClasses === undefined ? {} : _ref$cssClasses;
  var _ref$templates = _ref.templates;
  var templates = _ref$templates === undefined ? _defaultTemplates2.default : _ref$templates;
  var transformData = _ref.transformData;
  var _ref$hitsPerPage = _ref.hitsPerPage;
  var hitsPerPage = _ref$hitsPerPage === undefined ? 20 : _ref$hitsPerPage;

  if (!container) {
    throw new Error('Must provide a container.' + usage);
  }

  if (templates.item && templates.allItems) {
    throw new Error('Must contain only allItems OR item template.' + usage);
  }

  var containerNode = (0, _utils.getContainerNode)(container);
  var cssClasses = {
    root: (0, _classnames2.default)(bem(null), userCssClasses.root),
    item: (0, _classnames2.default)(bem('item'), userCssClasses.item),
    empty: (0, _classnames2.default)(bem(null, 'empty'), userCssClasses.empty)
  };

  return {
    getConfiguration: function getConfiguration() {
      return { hitsPerPage: hitsPerPage };
    },
    init: function init(_ref2) {
      var templatesConfig = _ref2.templatesConfig;

      this._templateProps = (0, _utils.prepareTemplateProps)({
        transformData: transformData,
        defaultTemplates: _defaultTemplates2.default,
        templatesConfig: templatesConfig,
        templates: templates
      });
    },
    render: function render(_ref3) {
      var results = _ref3.results;

      _reactDom2.default.render(_react2.default.createElement(_Hits2.default, {
        cssClasses: cssClasses,
        hits: results.hits,
        results: results,
        templateProps: this._templateProps
      }), containerNode);
    }
  };
}

exports.default = hits;