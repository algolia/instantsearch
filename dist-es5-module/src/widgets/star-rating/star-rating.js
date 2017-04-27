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

var _defaultLabels = require('./defaultLabels.js');

var _defaultLabels2 = _interopRequireDefault(_defaultLabels);

var _RefinementList = require('../../components/RefinementList/RefinementList.js');

var _RefinementList2 = _interopRequireDefault(_RefinementList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bem = (0, _utils.bemHelper)('ais-star-rating');

/**
 * Instantiate a list of refinements based on a rating attribute
 * The ratings must be integer values. You can still keep the precise float value in another attribute
 * to be used in the custom ranking configuration. So that the actual hits ranking is precise.
 * @function starRating
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for filtering
 * @param  {number} [options.max] The maximum rating value
 * @param  {Object} [options.labels] Labels used by the default template
 * @param  {string} [options.labels.andUp] The label suffixed after each line
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header] Header template
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties
 * @param  {string|Function} [options.templates.footer] Footer template
 * @param  {Function} [options.transformData.item] Function to change the object passed to the `item` template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to each link element
 * @param  {string|string[]} [options.cssClasses.disabledLink] CSS class to add to each disabled link (when using the default template)
 * @param  {string|string[]} [options.cssClasses.star] CSS class to add to each star element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.emptyStar] CSS class to add to each empty star element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
var usage = 'Usage:\nstarRating({\n  container,\n  attributeName,\n  [ max=5 ],\n  [ cssClasses.{root,header,body,footer,list,item,active,link,disabledLink,star,emptyStar,count} ],\n  [ templates.{header,item,footer} ],\n  [ transformData.{item} ],\n  [ labels.{andUp} ],\n  [ autoHideContainer=true ],\n  [ collapsible=false ]\n})';
function starRating(_ref) {
  var container = _ref.container;
  var attributeName = _ref.attributeName;
  var _ref$max = _ref.max;
  var max = _ref$max === undefined ? 5 : _ref$max;
  var _ref$cssClasses = _ref.cssClasses;
  var userCssClasses = _ref$cssClasses === undefined ? {} : _ref$cssClasses;
  var _ref$labels = _ref.labels;
  var labels = _ref$labels === undefined ? _defaultLabels2.default : _ref$labels;
  var _ref$templates = _ref.templates;
  var templates = _ref$templates === undefined ? _defaultTemplates2.default : _ref$templates;
  var _ref$collapsible = _ref.collapsible;
  var collapsible = _ref$collapsible === undefined ? false : _ref$collapsible;
  var transformData = _ref.transformData;
  var _ref$autoHideContaine = _ref.autoHideContainer;
  var autoHideContainer = _ref$autoHideContaine === undefined ? true : _ref$autoHideContaine;

  var containerNode = (0, _utils.getContainerNode)(container);
  var RefinementList = (0, _headerFooter2.default)(_RefinementList2.default);
  if (autoHideContainer === true) {
    RefinementList = (0, _autoHideContainer2.default)(RefinementList);
  }

  if (!container || !attributeName) {
    throw new Error(usage);
  }

  var cssClasses = {
    root: (0, _classnames2.default)(bem(null), userCssClasses.root),
    header: (0, _classnames2.default)(bem('header'), userCssClasses.header),
    body: (0, _classnames2.default)(bem('body'), userCssClasses.body),
    footer: (0, _classnames2.default)(bem('footer'), userCssClasses.footer),
    list: (0, _classnames2.default)(bem('list'), userCssClasses.list),
    item: (0, _classnames2.default)(bem('item'), userCssClasses.item),
    link: (0, _classnames2.default)(bem('link'), userCssClasses.link),
    disabledLink: (0, _classnames2.default)(bem('link', 'disabled'), userCssClasses.disabledLink),
    count: (0, _classnames2.default)(bem('count'), userCssClasses.count),
    star: (0, _classnames2.default)(bem('star'), userCssClasses.star),
    emptyStar: (0, _classnames2.default)(bem('star', 'empty'), userCssClasses.emptyStar),
    active: (0, _classnames2.default)(bem('item', 'active'), userCssClasses.active)
  };

  return {
    getConfiguration: function getConfiguration() {
      return { disjunctiveFacets: [attributeName] };
    },

    init: function init(_ref2) {
      var templatesConfig = _ref2.templatesConfig;
      var helper = _ref2.helper;

      this._templateProps = (0, _utils.prepareTemplateProps)({
        transformData: transformData,
        defaultTemplates: _defaultTemplates2.default,
        templatesConfig: templatesConfig,
        templates: templates
      });
      this._toggleRefinement = this._toggleRefinement.bind(this, helper);
    },
    render: function render(_ref3) {
      var helper = _ref3.helper;
      var results = _ref3.results;
      var state = _ref3.state;
      var createURL = _ref3.createURL;

      var facetValues = [];
      var allValues = {};
      for (var v = max - 1; v >= 0; --v) {
        allValues[v] = 0;
      }
      results.getFacetValues(attributeName).forEach(function (facet) {
        var val = Math.round(facet.name);
        if (!val || val > max - 1) {
          return;
        }
        for (var _v = val; _v >= 1; --_v) {
          allValues[_v] += facet.count;
        }
      });
      var refinedStar = this._getRefinedStar(helper);
      for (var star = max - 1; star >= 1; --star) {
        var count = allValues[star];
        if (refinedStar && star !== refinedStar && count === 0) {
          // skip count==0 when at least 1 refinement is enabled
          // eslint-disable-next-line no-continue
          continue;
        }
        var stars = [];
        for (var i = 1; i <= max; ++i) {
          stars.push(i <= star);
        }
        facetValues.push({
          stars: stars,
          name: String(star),
          count: count,
          isRefined: refinedStar === star,
          labels: labels
        });
      }

      // Bind createURL to this specific attribute
      function _createURL(facetValue) {
        return createURL(state.toggleRefinement(attributeName, facetValue));
      }

      _reactDom2.default.render(_react2.default.createElement(RefinementList, {
        collapsible: collapsible,
        createURL: _createURL,
        cssClasses: cssClasses,
        facetValues: facetValues,
        shouldAutoHideContainer: results.nbHits === 0,
        templateProps: this._templateProps,
        toggleRefinement: this._toggleRefinement
      }), containerNode);
    },
    _toggleRefinement: function _toggleRefinement(helper, facetValue) {
      var isRefined = this._getRefinedStar(helper) === Number(facetValue);
      helper.clearRefinements(attributeName);
      if (!isRefined) {
        for (var val = Number(facetValue); val <= max; ++val) {
          helper.addDisjunctiveFacetRefinement(attributeName, val);
        }
      }
      helper.search();
    },
    _getRefinedStar: function _getRefinedStar(helper) {
      var refinedStar = undefined;
      var refinements = helper.getRefinements(attributeName);
      refinements.forEach(function (r) {
        if (!refinedStar || Number(r.value) < refinedStar) {
          refinedStar = Number(r.value);
        }
      });
      return refinedStar;
    }
  };
}

exports.default = starRating;