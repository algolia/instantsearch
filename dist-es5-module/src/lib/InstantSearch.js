'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _algoliasearchLite = require('algoliasearch/src/browser/builds/algoliasearchLite.js');

var _algoliasearchLite2 = _interopRequireDefault(_algoliasearchLite);

var _algoliasearchHelper = require('algoliasearch-helper');

var _algoliasearchHelper2 = _interopRequireDefault(_algoliasearchHelper);

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _mergeWith = require('lodash/mergeWith');

var _mergeWith2 = _interopRequireDefault(_mergeWith);

var _union = require('lodash/union');

var _union2 = _interopRequireDefault(_union);

var _clone = require('lodash/clone');

var _clone2 = _interopRequireDefault(_clone);

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _events = require('events');

var _urlSync = require('./url-sync.js');

var _urlSync2 = _interopRequireDefault(_urlSync);

var _version = require('./version.js');

var _version2 = _interopRequireDefault(_version);

var _createHelpers = require('./createHelpers.js');

var _createHelpers2 = _interopRequireDefault(_createHelpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // we use the fullpath to the lite build to solve a meteor.js issue:
// https://github.com/algolia/instantsearch.js/issues/1024#issuecomment-221618284


function defaultCreateURL() {
  return '#';
}

/**
 * @function instantsearch
 * @param  {string} options.appId The Algolia application ID
 * @param  {string} options.apiKey The Algolia search-only API key
 * @param  {string} options.indexName The name of the main index
 * @param  {string} [options.numberLocale] The locale used to display numbers. This will be passed
 * to Number.prototype.toLocaleString()
 * @param  {function} [options.searchFunction] A hook that will be called each time a search needs to be done, with the
 * helper as a parameter. It's your responsibility to call helper.search(). This option allows you to avoid doing
 * searches at page load for example.
 * @param  {Object} [options.searchParameters] Additional parameters to pass to
 * the Algolia API.
 * [Full documentation](https://community.algolia.com/algoliasearch-helper-js/reference.html#searchparameters)
 * @param  {Object|boolean} [options.urlSync] Url synchronization configuration.
 * Setting to `true` will synchronize the needed search parameters with the browser url.
 * @param  {Object} [options.urlSync.mapping] Object used to define replacement query
 * parameter to use in place of another. Keys are current query parameters
 * and value the new value, e.g. `{ q: 'query' }`.
 * @param  {number} [options.urlSync.threshold] Idle time in ms after which a new
 * state is created in the browser history. The default value is 700. The url is always updated at each keystroke
 * but we only create a "previous search state" (activated when click on back button) every 700ms of idle time.
 * @param  {string[]} [options.urlSync.trackedParameters] Parameters that will
 * be synchronized in the URL. Default value is `['query', 'attribute:*',
 * 'index', 'page', 'hitsPerPage']`. `attribute:*` means all the faceting attributes will be tracked. You
 * can track only some of them by using [..., 'attribute:color', 'attribute:categories']. All other possible
 * values are all the [attributes of the Helper SearchParameters](https://community.algolia.com/algoliasearch-helper-js/reference.html#searchparameters).
 *
 * There's a special `is_v` parameter that will get added everytime, it tracks the version of instantsearch.js
 * linked to the url.
 * @param  {boolean} [options.urlSync.useHash] If set to true, the url will be
 * hash based. Otherwise, it'll use the query parameters using the modern
 * history API.
 * @param  {function} [options.urlSync.getHistoryState] Pass this function to override the
 * default history API state we set to `null`. For example this could be used to force passing
 * {turbolinks: true} to the history API every time we update it.
 * @return {Object} the instantsearch instance
 */

var InstantSearch = function (_EventEmitter) {
  _inherits(InstantSearch, _EventEmitter);

  function InstantSearch(_ref) {
    var _ref$appId = _ref.appId;
    var appId = _ref$appId === undefined ? null : _ref$appId;
    var _ref$apiKey = _ref.apiKey;
    var apiKey = _ref$apiKey === undefined ? null : _ref$apiKey;
    var _ref$indexName = _ref.indexName;
    var indexName = _ref$indexName === undefined ? null : _ref$indexName;
    var numberLocale = _ref.numberLocale;
    var _ref$searchParameters = _ref.searchParameters;
    var searchParameters = _ref$searchParameters === undefined ? {} : _ref$searchParameters;
    var _ref$urlSync = _ref.urlSync;
    var urlSync = _ref$urlSync === undefined ? null : _ref$urlSync;
    var searchFunction = _ref.searchFunction;

    _classCallCheck(this, InstantSearch);

    var _this = _possibleConstructorReturn(this, (InstantSearch.__proto__ || Object.getPrototypeOf(InstantSearch)).call(this));

    if (appId === null || apiKey === null || indexName === null) {
      var usage = '\nUsage: instantsearch({\n  appId: \'my_application_id\',\n  apiKey: \'my_search_api_key\',\n  indexName: \'my_index_name\'\n});';
      throw new Error(usage);
    }

    var client = (0, _algoliasearchLite2.default)(appId, apiKey);
    client.addAlgoliaAgent('instantsearch.js ' + _version2.default);

    _this.client = client;
    _this.helper = null;
    _this.indexName = indexName;
    _this.searchParameters = _extends({}, searchParameters, { index: indexName });
    _this.widgets = [];
    _this.templatesConfig = {
      helpers: (0, _createHelpers2.default)({ numberLocale: numberLocale }),
      compileOptions: {}
    };

    if (searchFunction) {
      _this._searchFunction = searchFunction;
    }

    _this.urlSync = urlSync === true ? {} : urlSync;
    return _this;
  }

  /**
   * Add a widget
   * @param  {Object} [widget] The widget to add
   * @param  {function} [widget.render] Called after each search response has been received
   * @param  {function} [widget.getConfiguration] Let the widget update the configuration
   * of the search with new parameters
   * @param  {function} [widget.init] Called once before the first search
   * @return {Object} the added widget
   */


  _createClass(InstantSearch, [{
    key: 'addWidget',
    value: function addWidget(widget) {
      // Add the widget to the list of widget
      if (widget.render === undefined && widget.init === undefined) {
        throw new Error('Widget definition missing render or init method');
      }

      this.widgets.push(widget);
    }
  }, {
    key: 'start',
    value: function start() {
      var _this2 = this;

      if (!this.widgets) throw new Error('No widgets were added to instantsearch.js');

      var searchParametersFromUrl = void 0;

      if (this.urlSync) {
        var syncWidget = (0, _urlSync2.default)(this.urlSync);
        this._createURL = syncWidget.createURL.bind(syncWidget);
        this._createAbsoluteURL = function (relative) {
          return _this2._createURL(relative, { absolute: true });
        };
        this._onHistoryChange = syncWidget.onHistoryChange.bind(syncWidget);
        this.widgets.push(syncWidget);
        searchParametersFromUrl = syncWidget.searchParametersFromUrl;
      } else {
        this._createURL = defaultCreateURL;
        this._createAbsoluteURL = defaultCreateURL;
        this._onHistoryChange = function () {};
      }

      this.searchParameters = this.widgets.reduce(enhanceConfiguration(searchParametersFromUrl), this.searchParameters);

      var helper = (0, _algoliasearchHelper2.default)(this.client, this.searchParameters.index || this.indexName, this.searchParameters);

      if (this._searchFunction) {
        this._originalHelperSearch = helper.search.bind(helper);
        helper.search = this._wrappedSearch.bind(this);
      }

      this.helper = helper;

      this._init(helper.state, helper);

      helper.on('result', this._render.bind(this, helper));
      helper.search();
    }
  }, {
    key: '_wrappedSearch',
    value: function _wrappedSearch() {
      var helper = (0, _clone2.default)(this.helper);
      helper.search = this._originalHelperSearch;
      this._searchFunction(helper);
      return;
    }
  }, {
    key: 'createURL',
    value: function createURL(params) {
      if (!this._createURL) {
        throw new Error('You need to call start() before calling createURL()');
      }
      return this._createURL(this.helper.state.setQueryParameters(params));
    }
  }, {
    key: '_render',
    value: function _render(helper, results, state) {
      var _this3 = this;

      (0, _forEach2.default)(this.widgets, function (widget) {
        if (!widget.render) {
          return;
        }
        widget.render({
          templatesConfig: _this3.templatesConfig,
          results: results,
          state: state,
          helper: helper,
          createURL: _this3._createAbsoluteURL
        });
      });
      this.emit('render');
    }
  }, {
    key: '_init',
    value: function _init(state, helper) {
      var _this4 = this;

      (0, _forEach2.default)(this.widgets, function (widget) {
        if (widget.init) {
          widget.init({
            state: state,
            helper: helper,
            templatesConfig: _this4.templatesConfig,
            createURL: _this4._createAbsoluteURL,
            onHistoryChange: _this4._onHistoryChange
          });
        }
      });
    }
  }]);

  return InstantSearch;
}(_events.EventEmitter);

function enhanceConfiguration(searchParametersFromUrl) {
  return function (configuration, widgetDefinition) {
    if (!widgetDefinition.getConfiguration) return configuration;

    // Get the relevant partial configuration asked by the widget
    var partialConfiguration = widgetDefinition.getConfiguration(configuration, searchParametersFromUrl);

    var customizer = function customizer(a, b) {
      // always create a unified array for facets refinements
      if (Array.isArray(a)) {
        return (0, _union2.default)(a, b);
      }

      // avoid mutating objects
      if ((0, _isPlainObject2.default)(a)) {
        return (0, _mergeWith2.default)({}, a, b, customizer);
      }

      return undefined;
    };

    return (0, _mergeWith2.default)({}, configuration, partialConfiguration, customizer);
  };
}

exports.default = InstantSearch;