'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _utils = require('../../lib/utils.js');

var _generateRanges2 = require('./generate-ranges.js');

var _generateRanges3 = _interopRequireDefault(_generateRanges2);

var _defaultTemplates = require('./defaultTemplates.js');

var _defaultTemplates2 = _interopRequireDefault(_defaultTemplates);

var _autoHideContainer = require('../../decorators/autoHideContainer.js');

var _autoHideContainer2 = _interopRequireDefault(_autoHideContainer);

var _headerFooter = require('../../decorators/headerFooter.js');

var _headerFooter2 = _interopRequireDefault(_headerFooter);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _PriceRanges = require('../../components/PriceRanges/PriceRanges.js');

var _PriceRanges2 = _interopRequireDefault(_PriceRanges);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bem = (0, _utils.bemHelper)('ais-price-ranges');

/**
 * Instantiate a price ranges on a numerical facet
 * @function priceRanges
 * @param  {string|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {string} options.attributeName Name of the attribute for faceting
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.item] Item template. Template data: `from`, `to` and `currency`
 * @param  {string} [options.currency='$'] The currency to display
 * @param  {Object} [options.labels] Labels to use for the widget
 * @param  {string|Function} [options.labels.separator] Separator label, between min and max
 * @param  {string|Function} [options.labels.button] Button label
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no refinements available
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the wrapping list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to the active item element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to each link element
 * @param  {string|string[]} [options.cssClasses.form] CSS class to add to the form element
 * @param  {string|string[]} [options.cssClasses.label] CSS class to add to each wrapping label of the form
 * @param  {string|string[]} [options.cssClasses.input] CSS class to add to each input of the form
 * @param  {string|string[]} [options.cssClasses.currency] CSS class to add to each currency element of the form
 * @param  {string|string[]} [options.cssClasses.separator] CSS class to add to the separator of the form
 * @param  {string|string[]} [options.cssClasses.button] CSS class to add to the submit button of the form
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
var usage = 'Usage:\npriceRanges({\n  container,\n  attributeName,\n  [ currency=$ ],\n  [ cssClasses.{root,header,body,list,item,active,link,form,label,input,currency,separator,button,footer} ],\n  [ templates.{header,item,footer} ],\n  [ labels.{currency,separator,button} ],\n  [ autoHideContainer=true ],\n  [ collapsible=false ]\n})';
function priceRanges() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var container = _ref.container;
  var attributeName = _ref.attributeName;
  var _ref$cssClasses = _ref.cssClasses;
  var userCssClasses = _ref$cssClasses === undefined ? {} : _ref$cssClasses;
  var _ref$templates = _ref.templates;
  var templates = _ref$templates === undefined ? _defaultTemplates2.default : _ref$templates;
  var _ref$collapsible = _ref.collapsible;
  var collapsible = _ref$collapsible === undefined ? false : _ref$collapsible;
  var _ref$labels = _ref.labels;
  var userLabels = _ref$labels === undefined ? {} : _ref$labels;
  var _ref$currency = _ref.currency;
  var userCurrency = _ref$currency === undefined ? '$' : _ref$currency;
  var _ref$autoHideContaine = _ref.autoHideContainer;
  var autoHideContainer = _ref$autoHideContaine === undefined ? true : _ref$autoHideContaine;

  var currency = userCurrency;

  if (!container || !attributeName) {
    throw new Error(usage);
  }

  var containerNode = (0, _utils.getContainerNode)(container);
  var PriceRanges = (0, _headerFooter2.default)(_PriceRanges2.default);
  if (autoHideContainer === true) {
    PriceRanges = (0, _autoHideContainer2.default)(PriceRanges);
  }

  var labels = _extends({
    button: 'Go',
    separator: 'to'
  }, userLabels);

  var cssClasses = {
    root: (0, _classnames2.default)(bem(null), userCssClasses.root),
    header: (0, _classnames2.default)(bem('header'), userCssClasses.header),
    body: (0, _classnames2.default)(bem('body'), userCssClasses.body),
    list: (0, _classnames2.default)(bem('list'), userCssClasses.list),
    link: (0, _classnames2.default)(bem('link'), userCssClasses.link),
    item: (0, _classnames2.default)(bem('item'), userCssClasses.item),
    active: (0, _classnames2.default)(bem('item', 'active'), userCssClasses.active),
    form: (0, _classnames2.default)(bem('form'), userCssClasses.form),
    label: (0, _classnames2.default)(bem('label'), userCssClasses.label),
    input: (0, _classnames2.default)(bem('input'), userCssClasses.input),
    currency: (0, _classnames2.default)(bem('currency'), userCssClasses.currency),
    button: (0, _classnames2.default)(bem('button'), userCssClasses.button),
    separator: (0, _classnames2.default)(bem('separator'), userCssClasses.separator),
    footer: (0, _classnames2.default)(bem('footer'), userCssClasses.footer)
  };

  // before we had opts.currency, you had to pass labels.currency
  if (userLabels.currency !== undefined && userLabels.currency !== currency) currency = userLabels.currency;

  return {
    getConfiguration: function getConfiguration() {
      return {
        facets: [attributeName]
      };
    },

    _generateRanges: function _generateRanges(results) {
      var stats = results.getFacetStats(attributeName);
      return (0, _generateRanges3.default)(stats);
    },
    _extractRefinedRange: function _extractRefinedRange(helper) {
      var refinements = helper.getRefinements(attributeName);
      var from = void 0;
      var to = void 0;

      if (refinements.length === 0) {
        return [];
      }

      refinements.forEach(function (v) {
        if (v.operator.indexOf('>') !== -1) {
          from = Math.floor(v.value[0]);
        } else if (v.operator.indexOf('<') !== -1) {
          to = Math.ceil(v.value[0]);
        }
      });
      return [{ from: from, to: to, isRefined: true }];
    },
    _refine: function _refine(helper, from, to) {
      var facetValues = this._extractRefinedRange(helper);

      helper.clearRefinements(attributeName);
      if (facetValues.length === 0 || facetValues[0].from !== from || facetValues[0].to !== to) {
        if (typeof from !== 'undefined') {
          helper.addNumericRefinement(attributeName, '>=', Math.floor(from));
        }
        if (typeof to !== 'undefined') {
          helper.addNumericRefinement(attributeName, '<=', Math.ceil(to));
        }
      }

      helper.search();
    },
    init: function init(_ref2) {
      var helper = _ref2.helper;
      var templatesConfig = _ref2.templatesConfig;

      this._refine = this._refine.bind(this, helper);
      this._templateProps = (0, _utils.prepareTemplateProps)({
        defaultTemplates: _defaultTemplates2.default,
        templatesConfig: templatesConfig,
        templates: templates
      });
    },
    render: function render(_ref3) {
      var results = _ref3.results;
      var helper = _ref3.helper;
      var state = _ref3.state;
      var createURL = _ref3.createURL;

      var facetValues = void 0;

      if (results.hits.length > 0) {
        facetValues = this._extractRefinedRange(helper);

        if (facetValues.length === 0) {
          facetValues = this._generateRanges(results);
        }
      } else {
        facetValues = [];
      }

      facetValues.map(function (facetValue) {
        var newState = state.clearRefinements(attributeName);
        if (!facetValue.isRefined) {
          if (facetValue.from !== undefined) {
            newState = newState.addNumericRefinement(attributeName, '>=', Math.floor(facetValue.from));
          }
          if (facetValue.to !== undefined) {
            newState = newState.addNumericRefinement(attributeName, '<=', Math.ceil(facetValue.to));
          }
        }
        facetValue.url = createURL(newState);
        return facetValue;
      });

      _reactDom2.default.render(_react2.default.createElement(PriceRanges, {
        collapsible: collapsible,
        cssClasses: cssClasses,
        currency: currency,
        facetValues: facetValues,
        labels: labels,
        refine: this._refine,
        shouldAutoHideContainer: facetValues.length === 0,
        templateProps: this._templateProps
      }), containerNode);
    }
  };
}

exports.default = priceRanges;