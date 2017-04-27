'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('../../lib/utils.js');

var _defaultTemplates = require('./defaultTemplates.js');

var _defaultTemplates2 = _interopRequireDefault(_defaultTemplates);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _autoHideContainer = require('../../decorators/autoHideContainer.js');

var _autoHideContainer2 = _interopRequireDefault(_autoHideContainer);

var _headerFooter = require('../../decorators/headerFooter.js');

var _headerFooter2 = _interopRequireDefault(_headerFooter);

var _RefinementList = require('../../components/RefinementList/RefinementList.js');

var _RefinementList2 = _interopRequireDefault(_RefinementList);

var _currentToggle = require('./implementations/currentToggle');

var _currentToggle2 = _interopRequireDefault(_currentToggle);

var _legacyToggle = require('./implementations/legacyToggle');

var _legacyToggle2 = _interopRequireDefault(_legacyToggle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bem = (0, _utils.bemHelper)('ais-toggle');

// we cannot use helper. because the facet is not yet declared in the helper
var hasFacetsRefinementsFor = function hasFacetsRefinementsFor(attributeName, searchParameters) {
  return searchParameters && searchParameters.facetsRefinements && searchParameters.facetsRefinements[attributeName] !== undefined;
};

/**
 * Instantiate the toggling of a boolean facet filter on and off.
 * @function toggle
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for faceting (eg. "free_shipping")
 * @param  {string} options.label Human-readable name of the filter (eg. "Free Shipping")
 * @param  {Object} [options.values] Lets you define the values to filter on when toggling
 * @param  {string|number|boolean} [options.values.on=true] Value to filter on when checked
 * @param  {string|number|boolean} [options.values.off=undefined] Value to filter on when unchecked
 * element (when using the default template). By default when switching to `off`, no refinement will be asked. So you
 * will get both `true` and `false` results. If you set the off value to `false` then you will get only objects
 * having `false` has a value for the selected attribute.
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header] Header template
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties
 * count is always the number of hits that would be shown if you toggle the widget. We also provide
 * `onFacetValue` and `offFacetValue` objects with according counts.
 * @param  {string|Function} [options.templates.footer] Footer template
 * @param  {Function} [options.transformData.item] Function to change the object passed to the `item` template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when there are no results
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [options.cssClasses.label] CSS class to add to each
 * label element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.checkbox] CSS class to add to each
 * checkbox element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.count] CSS class to add to each count
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
var usage = 'Usage:\ntoggle({\n  container,\n  attributeName,\n  label,\n  [ values={on: true, off: undefined} ],\n  [ cssClasses.{root,header,body,footer,list,item,active,label,checkbox,count} ],\n  [ templates.{header,item,footer} ],\n  [ transformData.{item} ],\n  [ autoHideContainer=true ],\n  [ collapsible=false ]\n})';
function toggle() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var container = _ref.container;
  var attributeName = _ref.attributeName;
  var label = _ref.label;
  var _ref$values = _ref.values;
  var userValues = _ref$values === undefined ? { on: true, off: undefined } : _ref$values;
  var _ref$templates = _ref.templates;
  var templates = _ref$templates === undefined ? _defaultTemplates2.default : _ref$templates;
  var _ref$collapsible = _ref.collapsible;
  var collapsible = _ref$collapsible === undefined ? false : _ref$collapsible;
  var _ref$cssClasses = _ref.cssClasses;
  var userCssClasses = _ref$cssClasses === undefined ? {} : _ref$cssClasses;
  var transformData = _ref.transformData;
  var _ref$autoHideContaine = _ref.autoHideContainer;
  var autoHideContainer = _ref$autoHideContaine === undefined ? true : _ref$autoHideContaine;

  var containerNode = (0, _utils.getContainerNode)(container);

  if (!container || !attributeName || !label) {
    throw new Error(usage);
  }

  var RefinementList = (0, _headerFooter2.default)(_RefinementList2.default);
  if (autoHideContainer === true) {
    RefinementList = (0, _autoHideContainer2.default)(RefinementList);
  }

  var hasAnOffValue = userValues.off !== undefined;

  var cssClasses = {
    root: (0, _classnames2.default)(bem(null), userCssClasses.root),
    header: (0, _classnames2.default)(bem('header'), userCssClasses.header),
    body: (0, _classnames2.default)(bem('body'), userCssClasses.body),
    footer: (0, _classnames2.default)(bem('footer'), userCssClasses.footer),
    list: (0, _classnames2.default)(bem('list'), userCssClasses.list),
    item: (0, _classnames2.default)(bem('item'), userCssClasses.item),
    active: (0, _classnames2.default)(bem('item', 'active'), userCssClasses.active),
    label: (0, _classnames2.default)(bem('label'), userCssClasses.label),
    checkbox: (0, _classnames2.default)(bem('checkbox'), userCssClasses.checkbox),
    count: (0, _classnames2.default)(bem('count'), userCssClasses.count)
  };

  // store the computed options for usage in the two toggle implementations
  var implemOptions = {
    attributeName: attributeName,
    label: label,
    userValues: userValues,
    templates: templates,
    collapsible: collapsible,
    transformData: transformData,
    hasAnOffValue: hasAnOffValue,
    containerNode: containerNode,
    RefinementList: RefinementList,
    cssClasses: cssClasses
  };

  return {
    getConfiguration: function getConfiguration(currentSearchParameters, searchParametersFromUrl) {
      var useLegacyToggle = hasFacetsRefinementsFor(attributeName, currentSearchParameters) || hasFacetsRefinementsFor(attributeName, searchParametersFromUrl);

      var toggleImplementation = useLegacyToggle ? (0, _legacyToggle2.default)(implemOptions) : (0, _currentToggle2.default)(implemOptions);

      this.init = toggleImplementation.init.bind(toggleImplementation);
      this.render = toggleImplementation.render.bind(toggleImplementation);
      return toggleImplementation.getConfiguration(currentSearchParameters, searchParametersFromUrl);
    },
    init: function init() {},
    render: function render() {}
  };
}

exports.default = toggle;