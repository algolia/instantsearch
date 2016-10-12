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

var _isUndefined = require('lodash/isUndefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _isBoolean = require('lodash/isBoolean');

var _isBoolean2 = _interopRequireDefault(_isBoolean);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _reduce = require('lodash/reduce');

var _reduce2 = _interopRequireDefault(_reduce);

var _filter = require('lodash/filter');

var _filter2 = _interopRequireDefault(_filter);

var _headerFooter = require('../../decorators/headerFooter.js');

var _headerFooter2 = _interopRequireDefault(_headerFooter);

var _autoHideContainer = require('../../decorators/autoHideContainer');

var _autoHideContainer2 = _interopRequireDefault(_autoHideContainer);

var _defaultTemplates = require('./defaultTemplates');

var _defaultTemplates2 = _interopRequireDefault(_defaultTemplates);

var _CurrentRefinedValues = require('../../components/CurrentRefinedValues/CurrentRefinedValues.js');

var _CurrentRefinedValues2 = _interopRequireDefault(_CurrentRefinedValues);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bem = (0, _utils.bemHelper)('ais-current-refined-values');

/**
 * Instantiate a list of current refinements with the possibility to clear them
 * @function currentRefinedValues
 * @param  {string|DOMElement}  options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array}             [option.attributes] Attributes configuration
 * @param  {string}            [option.attributes[].name] Required attribute name
 * @param  {string}            [option.attributes[].label] Attribute label (passed to the item template)
 * @param  {string|Function}   [option.attributes[].template] Attribute specific template
 * @param  {Function}          [option.attributes[].transformData] Attribute specific transformData
 * @param  {boolean|string}    [option.clearAll='before'] Clear all position (one of ('before', 'after', false))
 * @param  {boolean}           [options.onlyListedAttributes=false] Only use declared attributes
 * @param  {Object}            [options.templates] Templates to use for the widget
 * @param  {string|Function}   [options.templates.header] Header template
 * @param  {string|Function}   [options.templates.item] Item template
 * @param  {string|Function}   [options.templates.clearAll] Clear all template
 * @param  {string|Function}   [options.templates.footer] Footer template
 * @param  {Function}          [options.transformData.item] Function to change the object passed to the `item` template
 * @param  {boolean}           [options.autoHideContainer=true] Hide the container when no current refinements
 * @param  {Object}            [options.cssClasses] CSS classes to be added
 * @param  {string}            [options.cssClasses.root] CSS classes added to the root element
 * @param  {string}            [options.cssClasses.header] CSS classes added to the header element
 * @param  {string}            [options.cssClasses.body] CSS classes added to the body element
 * @param  {string}            [options.cssClasses.clearAll] CSS classes added to the clearAll element
 * @param  {string}            [options.cssClasses.list] CSS classes added to the list element
 * @param  {string}            [options.cssClasses.item] CSS classes added to the item element
 * @param  {string}            [options.cssClasses.link] CSS classes added to the link element
 * @param  {string}            [options.cssClasses.count] CSS classes added to the count element
 * @param  {string}            [options.cssClasses.footer] CSS classes added to the footer element
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
var usage = 'Usage:\ncurrentRefinedValues({\n  container,\n  [ attributes: [{name[, label, template, transformData]}] ],\n  [ onlyListedAttributes = false ],\n  [ clearAll = \'before\' ] // One of [\'before\', \'after\', false]\n  [ templates.{header,item,clearAll,footer} ],\n  [ transformData.{item} ],\n  [ autoHideContainer = true ],\n  [ cssClasses.{root, header, body, clearAll, list, item, link, count, footer} = {} ],\n  [ collapsible=false ]\n})';
function currentRefinedValues(_ref) {
  var container = _ref.container;
  var _ref$attributes = _ref.attributes;
  var attributes = _ref$attributes === undefined ? [] : _ref$attributes;
  var _ref$onlyListedAttrib = _ref.onlyListedAttributes;
  var onlyListedAttributes = _ref$onlyListedAttrib === undefined ? false : _ref$onlyListedAttrib;
  var _ref$clearAll = _ref.clearAll;
  var clearAll = _ref$clearAll === undefined ? 'before' : _ref$clearAll;
  var _ref$templates = _ref.templates;
  var templates = _ref$templates === undefined ? _defaultTemplates2.default : _ref$templates;
  var _ref$collapsible = _ref.collapsible;
  var collapsible = _ref$collapsible === undefined ? false : _ref$collapsible;
  var transformData = _ref.transformData;
  var _ref$autoHideContaine = _ref.autoHideContainer;
  var autoHideContainer = _ref$autoHideContaine === undefined ? true : _ref$autoHideContaine;
  var _ref$cssClasses = _ref.cssClasses;
  var userCssClasses = _ref$cssClasses === undefined ? {} : _ref$cssClasses;

  var attributesOK = (0, _isArray2.default)(attributes) && (0, _reduce2.default)(attributes, function (res, val) {
    return res && (0, _isPlainObject2.default)(val) && (0, _isString2.default)(val.name) && ((0, _isUndefined2.default)(val.label) || (0, _isString2.default)(val.label)) && ((0, _isUndefined2.default)(val.template) || (0, _isString2.default)(val.template) || (0, _isFunction2.default)(val.template)) && ((0, _isUndefined2.default)(val.transformData) || (0, _isFunction2.default)(val.transformData));
  }, true);

  var templatesKeys = ['header', 'item', 'clearAll', 'footer'];
  var templatesOK = (0, _isPlainObject2.default)(templates) && (0, _reduce2.default)(templates, function (res, val, key) {
    return res && templatesKeys.indexOf(key) !== -1 && ((0, _isString2.default)(val) || (0, _isFunction2.default)(val));
  }, true);

  var userCssClassesKeys = ['root', 'header', 'body', 'clearAll', 'list', 'item', 'link', 'count', 'footer'];
  var userCssClassesOK = (0, _isPlainObject2.default)(userCssClasses) && (0, _reduce2.default)(userCssClasses, function (res, val, key) {
    return res && userCssClassesKeys.indexOf(key) !== -1 && (0, _isString2.default)(val) || (0, _isArray2.default)(val);
  }, true);

  var transformDataOK = (0, _isUndefined2.default)(transformData) || (0, _isFunction2.default)(transformData) || (0, _isPlainObject2.default)(transformData) && (0, _isFunction2.default)(transformData.item);

  var showUsage = false || !((0, _isString2.default)(container) || (0, _utils.isDomElement)(container)) || !(0, _isArray2.default)(attributes) || !attributesOK || !(0, _isBoolean2.default)(onlyListedAttributes) || [false, 'before', 'after'].indexOf(clearAll) === -1 || !(0, _isPlainObject2.default)(templates) || !templatesOK || !transformDataOK || !(0, _isBoolean2.default)(autoHideContainer) || !userCssClassesOK;

  if (showUsage) {
    throw new Error(usage);
  }

  var containerNode = (0, _utils.getContainerNode)(container);
  var CurrentRefinedValues = (0, _headerFooter2.default)(_CurrentRefinedValues2.default);
  if (autoHideContainer === true) {
    CurrentRefinedValues = (0, _autoHideContainer2.default)(CurrentRefinedValues);
  }

  var attributeNames = (0, _map2.default)(attributes, function (attribute) {
    return attribute.name;
  });
  var restrictedTo = onlyListedAttributes ? attributeNames : [];

  var attributesObj = (0, _reduce2.default)(attributes, function (res, attribute) {
    res[attribute.name] = attribute;
    return res;
  }, {});

  return {
    init: function init(_ref2) {
      var helper = _ref2.helper;

      this._clearRefinementsAndSearch = _utils.clearRefinementsAndSearch.bind(null, helper, restrictedTo);
    },
    render: function render(_ref3) {
      var results = _ref3.results;
      var helper = _ref3.helper;
      var state = _ref3.state;
      var templatesConfig = _ref3.templatesConfig;
      var createURL = _ref3.createURL;

      var cssClasses = {
        root: (0, _classnames2.default)(bem(null), userCssClasses.root),
        header: (0, _classnames2.default)(bem('header'), userCssClasses.header),
        body: (0, _classnames2.default)(bem('body'), userCssClasses.body),
        clearAll: (0, _classnames2.default)(bem('clear-all'), userCssClasses.clearAll),
        list: (0, _classnames2.default)(bem('list'), userCssClasses.list),
        item: (0, _classnames2.default)(bem('item'), userCssClasses.item),
        link: (0, _classnames2.default)(bem('link'), userCssClasses.link),
        count: (0, _classnames2.default)(bem('count'), userCssClasses.count),
        footer: (0, _classnames2.default)(bem('footer'), userCssClasses.footer)
      };

      var templateProps = (0, _utils.prepareTemplateProps)({
        transformData: transformData,
        defaultTemplates: _defaultTemplates2.default,
        templatesConfig: templatesConfig,
        templates: templates
      });

      var clearAllURL = createURL((0, _utils.clearRefinementsFromState)(state, restrictedTo));

      var refinements = getFilteredRefinements(results, state, attributeNames, onlyListedAttributes);
      var clearRefinementURLs = refinements.map(function (refinement) {
        return createURL(clearRefinementFromState(state, refinement));
      });
      var clearRefinementClicks = refinements.map(function (refinement) {
        return clearRefinement.bind(null, helper, refinement);
      });

      var shouldAutoHideContainer = refinements.length === 0;

      _reactDom2.default.render(_react2.default.createElement(CurrentRefinedValues, {
        attributes: attributesObj,
        clearAllClick: this._clearRefinementsAndSearch,
        clearAllPosition: clearAll,
        clearAllURL: clearAllURL,
        clearRefinementClicks: clearRefinementClicks,
        clearRefinementURLs: clearRefinementURLs,
        collapsible: collapsible,
        cssClasses: cssClasses,
        refinements: refinements,
        shouldAutoHideContainer: shouldAutoHideContainer,
        templateProps: templateProps
      }), containerNode);
    }
  };
}

function getRestrictedIndexForSort(attributeNames, otherAttributeNames, attributeName) {
  var idx = attributeNames.indexOf(attributeName);
  if (idx !== -1) {
    return idx;
  }
  return attributeNames.length + otherAttributeNames.indexOf(attributeName);
}

function compareRefinements(attributeNames, otherAttributeNames, a, b) {
  var idxa = getRestrictedIndexForSort(attributeNames, otherAttributeNames, a.attributeName);
  var idxb = getRestrictedIndexForSort(attributeNames, otherAttributeNames, b.attributeName);
  if (idxa === idxb) {
    if (a.name === b.name) {
      return 0;
    }
    return a.name < b.name ? -1 : 1;
  }
  return idxa < idxb ? -1 : 1;
}

function getFilteredRefinements(results, state, attributeNames, onlyListedAttributes) {
  var refinements = (0, _utils.getRefinements)(results, state);
  var otherAttributeNames = (0, _reduce2.default)(refinements, function (res, refinement) {
    if (attributeNames.indexOf(refinement.attributeName) === -1 && res.indexOf(refinement.attributeName === -1)) {
      res.push(refinement.attributeName);
    }
    return res;
  }, []);
  refinements = refinements.sort(compareRefinements.bind(null, attributeNames, otherAttributeNames));
  if (onlyListedAttributes && !(0, _isEmpty2.default)(attributeNames)) {
    refinements = (0, _filter2.default)(refinements, function (refinement) {
      return attributeNames.indexOf(refinement.attributeName) !== -1;
    });
  }
  return refinements;
}

function clearRefinementFromState(state, refinement) {
  switch (refinement.type) {
    case 'facet':
      return state.removeFacetRefinement(refinement.attributeName, refinement.name);
    case 'disjunctive':
      return state.removeDisjunctiveFacetRefinement(refinement.attributeName, refinement.name);
    case 'hierarchical':
      return state.clearRefinements(refinement.attributeName);
    case 'exclude':
      return state.removeExcludeRefinement(refinement.attributeName, refinement.name);
    case 'numeric':
      return state.removeNumericRefinement(refinement.attributeName, refinement.operator, refinement.numericValue);
    case 'tag':
      return state.removeTagRefinement(refinement.name);
    default:
      throw new Error('clearRefinement: type ' + refinement.type + ' is not handled');
  }
}

function clearRefinement(helper, refinement) {
  helper.setState(clearRefinementFromState(helper.state, refinement)).search();
}

exports.default = currentRefinedValues;