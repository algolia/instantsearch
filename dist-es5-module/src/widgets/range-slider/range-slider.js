'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _utils = require('../../lib/utils.js');

var _find = require('lodash/find');

var _find2 = _interopRequireDefault(_find);

var _autoHideContainer = require('../../decorators/autoHideContainer.js');

var _autoHideContainer2 = _interopRequireDefault(_autoHideContainer);

var _headerFooter = require('../../decorators/headerFooter.js');

var _headerFooter2 = _interopRequireDefault(_headerFooter);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _Slider = require('../../components/Slider/Slider.js');

var _Slider2 = _interopRequireDefault(_Slider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var bem = (0, _utils.bemHelper)('ais-range-slider');
var defaultTemplates = {
  header: '',
  footer: ''
};

/**
 * Instantiate a slider based on a numeric attribute.
 * This is a wrapper around [noUiSlider](http://refreshless.com/nouislider/)
 * @function rangeSlider
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for faceting
 * @param  {boolean|Object} [options.tooltips=true] Should we show tooltips or not.
 * The default tooltip will show the raw value.
 * You can also provide
 * `tooltips: {format: function(rawValue) {return '$' + Math.round(rawValue).toLocaleString()}}`
 * So that you can format the tooltip display value as you want
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no refinements available
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {boolean|object} [options.pips=true] Show slider pips.
 * @param  {boolean|object} [options.step=1] Every handle move will jump that number of steps.
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @param  {number} [options.min] Minimal slider value, default to automatically computed from the result set
 * @param  {number} [options.max] Maximal slider value, defaults to automatically computed from the result set
 * @return {Object}
 */
var usage = 'Usage:\nrangeSlider({\n  container,\n  attributeName,\n  [ tooltips=true ],\n  [ templates.{header, footer} ],\n  [ cssClasses.{root, header, body, footer} ],\n  [ step=1 ],\n  [ pips=true ],\n  [ autoHideContainer=true ],\n  [ collapsible=false ],\n  [ min ],\n  [ max ]\n});\n';
function rangeSlider() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var container = _ref.container;
  var attributeName = _ref.attributeName;
  var _ref$tooltips = _ref.tooltips;
  var tooltips = _ref$tooltips === undefined ? true : _ref$tooltips;
  var _ref$templates = _ref.templates;
  var templates = _ref$templates === undefined ? defaultTemplates : _ref$templates;
  var _ref$collapsible = _ref.collapsible;
  var collapsible = _ref$collapsible === undefined ? false : _ref$collapsible;
  var _ref$cssClasses = _ref.cssClasses;
  var userCssClasses = _ref$cssClasses === undefined ? {} : _ref$cssClasses;
  var _ref$step = _ref.step;
  var step = _ref$step === undefined ? 1 : _ref$step;
  var _ref$pips = _ref.pips;
  var pips = _ref$pips === undefined ? true : _ref$pips;
  var _ref$autoHideContaine = _ref.autoHideContainer;
  var autoHideContainer = _ref$autoHideContaine === undefined ? true : _ref$autoHideContaine;
  var userMin = _ref.min;
  var userMax = _ref.max;
  var _ref$precision = _ref.precision;
  var precision = _ref$precision === undefined ? 2 : _ref$precision;

  if (!container || !attributeName) {
    throw new Error(usage);
  }

  var formatToNumber = function formatToNumber(v) {
    return Number(Number(v).toFixed(precision));
  };

  var sliderFormatter = {
    from: function from(v) {
      return v;
    },
    to: function to(v) {
      return formatToNumber(v).toLocaleString();
    }
  };

  var containerNode = (0, _utils.getContainerNode)(container);
  var Slider = (0, _headerFooter2.default)(_Slider2.default);
  if (autoHideContainer === true) {
    Slider = (0, _autoHideContainer2.default)(Slider);
  }

  var cssClasses = {
    root: (0, _classnames2.default)(bem(null), userCssClasses.root),
    header: (0, _classnames2.default)(bem('header'), userCssClasses.header),
    body: (0, _classnames2.default)(bem('body'), userCssClasses.body),
    footer: (0, _classnames2.default)(bem('footer'), userCssClasses.footer)
  };

  return {
    getConfiguration: function getConfiguration(originalConf) {
      var conf = {
        disjunctiveFacets: [attributeName]
      };

      if ((userMin !== undefined || userMax !== undefined) && (!originalConf || originalConf.numericRefinements && originalConf.numericRefinements[attributeName] === undefined)) {
        conf.numericRefinements = _defineProperty({}, attributeName, {});

        if (userMin !== undefined) {
          conf.numericRefinements[attributeName]['>='] = [userMin];
        }

        if (userMax !== undefined) {
          conf.numericRefinements[attributeName]['<='] = [userMax];
        }
      }

      return conf;
    },
    _getCurrentRefinement: function _getCurrentRefinement(helper) {
      var min = helper.state.getNumericRefinement(attributeName, '>=');
      var max = helper.state.getNumericRefinement(attributeName, '<=');

      if (min && min.length) {
        min = min[0];
      } else {
        min = -Infinity;
      }

      if (max && max.length) {
        max = max[0];
      } else {
        max = Infinity;
      }

      return {
        min: min,
        max: max
      };
    },
    _refine: function _refine(helper, oldValues, newValues) {
      helper.clearRefinements(attributeName);
      if (newValues[0] > oldValues.min) {
        helper.addNumericRefinement(attributeName, '>=', formatToNumber(newValues[0]));
      }
      if (newValues[1] < oldValues.max) {
        helper.addNumericRefinement(attributeName, '<=', formatToNumber(newValues[1]));
      }
      helper.search();
    },
    init: function init(_ref2) {
      var templatesConfig = _ref2.templatesConfig;

      this._templateProps = (0, _utils.prepareTemplateProps)({
        defaultTemplates: defaultTemplates,
        templatesConfig: templatesConfig,
        templates: templates
      });
    },
    render: function render(_ref3) {
      var results = _ref3.results;
      var helper = _ref3.helper;

      var facet = (0, _find2.default)(results.disjunctiveFacets, { name: attributeName });
      var stats = facet !== undefined && facet.stats !== undefined ? facet.stats : {
        min: null,
        max: null
      };

      if (userMin !== undefined) stats.min = userMin;
      if (userMax !== undefined) stats.max = userMax;

      var currentRefinement = this._getCurrentRefinement(helper);

      if (tooltips.format !== undefined) {
        tooltips = [{ to: tooltips.format }, { to: tooltips.format }];
      }

      _reactDom2.default.render(_react2.default.createElement(Slider, {
        collapsible: collapsible,
        cssClasses: cssClasses,
        onChange: this._refine.bind(this, helper, stats),
        pips: pips,
        range: { min: Math.floor(stats.min), max: Math.ceil(stats.max) },
        shouldAutoHideContainer: stats.min === stats.max,
        start: [currentRefinement.min, currentRefinement.max],
        step: step,
        templateProps: this._templateProps,
        tooltips: tooltips,
        format: sliderFormatter
      }), containerNode);
    }
  };
}

exports.default = rangeSlider;