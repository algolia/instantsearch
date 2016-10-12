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

var _headerFooter = require('../../decorators/headerFooter.js');

var _headerFooter2 = _interopRequireDefault(_headerFooter);

var _defaultTemplates = require('./defaultTemplates.js');

var _defaultTemplates2 = _interopRequireDefault(_defaultTemplates);

var _RefinementList = require('../../components/RefinementList/RefinementList.js');

var _RefinementList2 = _interopRequireDefault(_RefinementList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bem = (0, _utils.bemHelper)('ais-hierarchical-menu');
/**
 * Create a hierarchical menu using multiple attributes
 * @function hierarchicalMenu
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string[]} options.attributes Array of attributes to use to generate the hierarchy of the menu.
 * See the example for the convention to follow.
 * @param  {string} [options.separator=' > '] Separator used in the attributes to separate level values.
 * @param  {string} [options.rootPath] Prefix path to use if the first level is not the root level.
 * @param  {string} [options.showParentLevel=false] Show the parent level of the current refined value
 * @param  {number} [options.limit=10] How much facet values to get
 * @param  {string[]|Function} [options.sortBy=['name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template (root level only)
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties
 * @param  {string|Function} [options.templates.footer=''] Footer template (root level only)
 * @param  {Function} [options.transformData.item] Method to change the object passed to the `item` template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when there are no items in the menu
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.depth] CSS class to add to each item element to denote its depth. The actual level will be appended to the given class name (ie. if `depth` is given, the widget will add `depth0`, `depth1`, ... according to the level of each item).
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to each link (when using the default template)
 * @param  {string|string[]} [options.cssClasses.count] CSS class to add to each count element (when using the default template)
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
var usage = 'Usage:\nhierarchicalMenu({\n  container,\n  attributes,\n  [ separator=\' > \' ],\n  [ rootPath ],\n  [ showParentLevel=true ],\n  [ limit=10 ],\n  [ sortBy=[\'name:asc\'] ],\n  [ cssClasses.{root , header, body, footer, list, depth, item, active, link}={} ],\n  [ templates.{header, item, footer} ],\n  [ transformData.{item} ],\n  [ autoHideContainer=true ],\n  [ collapsible=false ]\n})';
function hierarchicalMenu() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var container = _ref.container;
  var attributes = _ref.attributes;
  var _ref$separator = _ref.separator;
  var separator = _ref$separator === undefined ? ' > ' : _ref$separator;
  var _ref$rootPath = _ref.rootPath;
  var rootPath = _ref$rootPath === undefined ? null : _ref$rootPath;
  var _ref$showParentLevel = _ref.showParentLevel;
  var showParentLevel = _ref$showParentLevel === undefined ? true : _ref$showParentLevel;
  var _ref$limit = _ref.limit;
  var limit = _ref$limit === undefined ? 10 : _ref$limit;
  var _ref$sortBy = _ref.sortBy;
  var sortBy = _ref$sortBy === undefined ? ['name:asc'] : _ref$sortBy;
  var _ref$cssClasses = _ref.cssClasses;
  var userCssClasses = _ref$cssClasses === undefined ? {} : _ref$cssClasses;
  var _ref$autoHideContaine = _ref.autoHideContainer;
  var autoHideContainer = _ref$autoHideContaine === undefined ? true : _ref$autoHideContaine;
  var _ref$templates = _ref.templates;
  var templates = _ref$templates === undefined ? _defaultTemplates2.default : _ref$templates;
  var _ref$collapsible = _ref.collapsible;
  var collapsible = _ref$collapsible === undefined ? false : _ref$collapsible;
  var transformData = _ref.transformData;

  if (!container || !attributes || !attributes.length) {
    throw new Error(usage);
  }

  var containerNode = (0, _utils.getContainerNode)(container);

  var RefinementList = (0, _headerFooter2.default)(_RefinementList2.default);
  if (autoHideContainer === true) {
    RefinementList = (0, _autoHideContainer2.default)(RefinementList);
  }

  // we need to provide a hierarchicalFacet name for the search state
  // so that we can always map $hierarchicalFacetName => real attributes
  // we use the first attribute name
  var hierarchicalFacetName = attributes[0];

  var cssClasses = {
    root: (0, _classnames2.default)(bem(null), userCssClasses.root),
    header: (0, _classnames2.default)(bem('header'), userCssClasses.header),
    body: (0, _classnames2.default)(bem('body'), userCssClasses.body),
    footer: (0, _classnames2.default)(bem('footer'), userCssClasses.footer),
    list: (0, _classnames2.default)(bem('list'), userCssClasses.list),
    depth: bem('list', 'lvl'),
    item: (0, _classnames2.default)(bem('item'), userCssClasses.item),
    active: (0, _classnames2.default)(bem('item', 'active'), userCssClasses.active),
    link: (0, _classnames2.default)(bem('link'), userCssClasses.link),
    count: (0, _classnames2.default)(bem('count'), userCssClasses.count)
  };

  return {
    getConfiguration: function getConfiguration(currentConfiguration) {
      return {
        hierarchicalFacets: [{
          name: hierarchicalFacetName,
          attributes: attributes,
          separator: separator,
          rootPath: rootPath,
          showParentLevel: showParentLevel
        }],
        maxValuesPerFacet: currentConfiguration.maxValuesPerFacet !== undefined ? Math.max(currentConfiguration.maxValuesPerFacet, limit) : limit
      };
    },
    init: function init(_ref2) {
      var helper = _ref2.helper;
      var templatesConfig = _ref2.templatesConfig;

      this._toggleRefinement = function (facetValue) {
        return helper.toggleRefinement(hierarchicalFacetName, facetValue).search();
      };

      this._templateProps = (0, _utils.prepareTemplateProps)({
        transformData: transformData,
        defaultTemplates: _defaultTemplates2.default,
        templatesConfig: templatesConfig,
        templates: templates
      });
    },
    _prepareFacetValues: function _prepareFacetValues(facetValues, state) {
      var _this = this;

      return facetValues.slice(0, limit).map(function (subValue) {
        if (Array.isArray(subValue.data)) {
          subValue.data = _this._prepareFacetValues(subValue.data, state);
        }

        return subValue;
      });
    },
    render: function render(_ref3) {
      var results = _ref3.results;
      var state = _ref3.state;
      var createURL = _ref3.createURL;

      var facetValues = results.getFacetValues(hierarchicalFacetName, { sortBy: sortBy }).data || [];
      facetValues = this._prepareFacetValues(facetValues, state);

      // Bind createURL to this specific attribute
      function _createURL(facetValue) {
        return createURL(state.toggleRefinement(hierarchicalFacetName, facetValue));
      }

      _reactDom2.default.render(_react2.default.createElement(RefinementList, {
        attributeNameKey: 'path',
        collapsible: collapsible,
        createURL: _createURL,
        cssClasses: cssClasses,
        facetValues: facetValues,
        shouldAutoHideContainer: facetValues.length === 0,
        templateProps: this._templateProps,
        toggleRefinement: this._toggleRefinement
      }), containerNode);
    }
  };
}

exports.default = hierarchicalMenu;