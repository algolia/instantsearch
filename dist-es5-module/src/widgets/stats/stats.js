'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _utils = require('../../lib/utils.js');

var _autoHideContainer = require('../../decorators/autoHideContainer.js');

var _autoHideContainer2 = _interopRequireDefault(_autoHideContainer);

var _headerFooter = require('../../decorators/headerFooter.js');

var _headerFooter2 = _interopRequireDefault(_headerFooter);

var _Stats = require('../../components/Stats/Stats.js');

var _Stats2 = _interopRequireDefault(_Stats);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _defaultTemplates = require('./defaultTemplates.js');

var _defaultTemplates2 = _interopRequireDefault(_defaultTemplates);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bem = (0, _utils.bemHelper)('ais-stats');

/**
 * Display various stats about the current search state
 * @function stats
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.body] Body template, provided with `hasManyResults`,
 * `hasNoResults`, `hasOneResult`, `hitsPerPage`, `nbHits`, `nbPages`, `page`, `processingTimeMS`, `query`
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData.body] Function to change the object passed to the `body` template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.time] CSS class to add to the element wrapping the time processingTimeMs
 * @return {Object}
 */
var usage = 'Usage:\nstats({\n  container,\n  [ templates.{header,body,footer} ],\n  [ transformData.{body} ],\n  [ autoHideContainer]\n})';
function stats() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var container = _ref.container;
  var _ref$cssClasses = _ref.cssClasses;
  var userCssClasses = _ref$cssClasses === undefined ? {} : _ref$cssClasses;
  var _ref$autoHideContaine = _ref.autoHideContainer;
  var autoHideContainer = _ref$autoHideContaine === undefined ? true : _ref$autoHideContaine;
  var _ref$templates = _ref.templates;
  var templates = _ref$templates === undefined ? _defaultTemplates2.default : _ref$templates;
  var _ref$collapsible = _ref.collapsible;
  var collapsible = _ref$collapsible === undefined ? false : _ref$collapsible;
  var transformData = _ref.transformData;

  if (!container) throw new Error(usage);
  var containerNode = (0, _utils.getContainerNode)(container);

  var Stats = (0, _headerFooter2.default)(_Stats2.default);
  if (autoHideContainer === true) {
    Stats = (0, _autoHideContainer2.default)(Stats);
  }

  if (!containerNode) {
    throw new Error(usage);
  }

  var cssClasses = {
    body: (0, _classnames2.default)(bem('body'), userCssClasses.body),
    footer: (0, _classnames2.default)(bem('footer'), userCssClasses.footer),
    header: (0, _classnames2.default)(bem('header'), userCssClasses.header),
    root: (0, _classnames2.default)(bem(null), userCssClasses.root),
    time: (0, _classnames2.default)(bem('time'), userCssClasses.time)
  };

  return {
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

      _reactDom2.default.render(_react2.default.createElement(Stats, {
        collapsible: collapsible,
        cssClasses: cssClasses,
        hitsPerPage: results.hitsPerPage,
        nbHits: results.nbHits,
        nbPages: results.nbPages,
        page: results.page,
        processingTimeMS: results.processingTimeMS,
        query: results.query,
        shouldAutoHideContainer: results.nbHits === 0,
        templateProps: this._templateProps
      }), containerNode);
    }
  };
}

exports.default = stats;