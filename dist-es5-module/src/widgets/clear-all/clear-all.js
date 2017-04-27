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

var _ClearAll = require('../../components/ClearAll/ClearAll.js');

var _ClearAll2 = _interopRequireDefault(_ClearAll);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bem = (0, _utils.bemHelper)('ais-clear-all');

/**
 * Allows to clear all refinements at once
 * @function clearAll
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header] Header template
 * @param  {string|Function} [options.templates.link] Link template
 * @param  {string|Function} [options.templates.footer] Footer template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when there's no refinement to clear
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to the link element
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
var usage = 'Usage:\nclearAll({\n  container,\n  [ cssClasses.{root,header,body,footer,link}={} ],\n  [ templates.{header,link,footer}={link: \'Clear all\'} ],\n  [ autoHideContainer=true ],\n  [ collapsible=false ],\n  [ excludeAttributes=[] ]\n})';
function clearAll() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var container = _ref.container;
  var _ref$templates = _ref.templates;
  var templates = _ref$templates === undefined ? _defaultTemplates2.default : _ref$templates;
  var _ref$cssClasses = _ref.cssClasses;
  var userCssClasses = _ref$cssClasses === undefined ? {} : _ref$cssClasses;
  var _ref$collapsible = _ref.collapsible;
  var collapsible = _ref$collapsible === undefined ? false : _ref$collapsible;
  var _ref$autoHideContaine = _ref.autoHideContainer;
  var autoHideContainer = _ref$autoHideContaine === undefined ? true : _ref$autoHideContaine;
  var _ref$excludeAttribute = _ref.excludeAttributes;
  var excludeAttributes = _ref$excludeAttribute === undefined ? [] : _ref$excludeAttribute;

  if (!container) {
    throw new Error(usage);
  }

  var containerNode = (0, _utils.getContainerNode)(container);
  var ClearAll = (0, _headerFooter2.default)(_ClearAll2.default);
  if (autoHideContainer === true) {
    ClearAll = (0, _autoHideContainer2.default)(ClearAll);
  }

  var cssClasses = {
    root: (0, _classnames2.default)(bem(null), userCssClasses.root),
    header: (0, _classnames2.default)(bem('header'), userCssClasses.header),
    body: (0, _classnames2.default)(bem('body'), userCssClasses.body),
    footer: (0, _classnames2.default)(bem('footer'), userCssClasses.footer),
    link: (0, _classnames2.default)(bem('link'), userCssClasses.link)
  };

  return {
    init: function init(_ref2) {
      var helper = _ref2.helper;
      var templatesConfig = _ref2.templatesConfig;

      this.clearAll = this.clearAll.bind(this, helper);
      this._templateProps = (0, _utils.prepareTemplateProps)({ defaultTemplates: _defaultTemplates2.default, templatesConfig: templatesConfig, templates: templates });
    },
    render: function render(_ref3) {
      var results = _ref3.results;
      var state = _ref3.state;
      var createURL = _ref3.createURL;

      this.clearAttributes = (0, _utils.getRefinements)(results, state).map(function (one) {
        return one.attributeName;
      }).filter(function (one) {
        return excludeAttributes.indexOf(one) === -1;
      });
      var hasRefinements = this.clearAttributes.length !== 0;
      var url = createURL((0, _utils.clearRefinementsFromState)(state));

      _reactDom2.default.render(_react2.default.createElement(ClearAll, {
        clearAll: this.clearAll,
        collapsible: collapsible,
        cssClasses: cssClasses,
        hasRefinements: hasRefinements,
        shouldAutoHideContainer: !hasRefinements,
        templateProps: this._templateProps,
        url: url
      }), containerNode);
    },
    clearAll: function clearAll(helper) {
      if (this.clearAttributes.length > 0) {
        (0, _utils.clearRefinementsAndSearch)(helper, this.clearAttributes);
      }
    }
  };
}

exports.default = clearAll;