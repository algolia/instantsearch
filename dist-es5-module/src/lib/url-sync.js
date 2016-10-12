'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _algoliasearchHelper = require('algoliasearch-helper');

var _algoliasearchHelper2 = _interopRequireDefault(_algoliasearchHelper);

var _version = require('../lib/version.js');

var _version2 = _interopRequireDefault(_version);

var _url = require('algoliasearch-helper/src/url');

var _url2 = _interopRequireDefault(_url);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _assign = require('lodash/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AlgoliaSearchHelper = _algoliasearchHelper2.default.AlgoliaSearchHelper;
var majorVersionNumber = _version2.default.split('.')[0];
var firstRender = true;

function timerMaker(t0) {
  var t = t0;
  return function timer() {
    var now = Date.now();
    var delta = now - t;
    t = now;
    return delta;
  };
}

/**
 * @typedef {object} UrlUtil
 * @property {string} character the character used in the url
 * @property {function} onpopstate add an event listener for the URL change
 * @property {function} pushState creates a new entry in the browser history
 * @property {function} replaceState update the current entry of the browser history
 * @property {function} readUrl reads the query string of the parameters
 */

/**
 * Handles the legacy browsers
 * @type {UrlUtil}
 */
var hashUrlUtils = {
  character: '#',
  onpopstate: function onpopstate(cb) {
    window.addEventListener('hashchange', cb);
  },
  pushState: function pushState(qs) {
    window.location.assign(getFullURL(this.createURL(qs)));
  },
  replaceState: function replaceState(qs) {
    window.location.replace(getFullURL(this.createURL(qs)));
  },
  createURL: function createURL(qs) {
    return window.location.search + this.character + qs;
  },
  readUrl: function readUrl() {
    return window.location.hash.slice(1);
  }
};

/**
 * Handles the modern API
 * @type {UrlUtil}
 */
var modernUrlUtils = {
  character: '?',
  onpopstate: function onpopstate(cb) {
    window.addEventListener('popstate', cb);
  },
  pushState: function pushState(qs, _ref) {
    var getHistoryState = _ref.getHistoryState;

    window.history.pushState(getHistoryState(), '', getFullURL(this.createURL(qs)));
  },
  replaceState: function replaceState(qs, _ref2) {
    var getHistoryState = _ref2.getHistoryState;

    window.history.replaceState(getHistoryState(), '', getFullURL(this.createURL(qs)));
  },
  createURL: function createURL(qs) {
    return this.character + qs + document.location.hash;
  },
  readUrl: function readUrl() {
    return window.location.search.slice(1);
  }
};

// we always push the full url to the url bar. Not a relative one.
// So that we handle cases like using a <base href>, see
// https://github.com/algolia/instantsearch.js/issues/790 for the original issue
function getFullURL(relative) {
  return getLocationOrigin() + window.location.pathname + relative;
}

// IE <= 11 has no location.origin or buggy
function getLocationOrigin() {
  // eslint-disable-next-line max-len
  return window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
}

// see InstantSearch.js file for urlSync options

var URLSync = function () {
  function URLSync(urlUtils, options) {
    _classCallCheck(this, URLSync);

    this.urlUtils = urlUtils;
    this.originalConfig = null;
    this.timer = timerMaker(Date.now());
    this.mapping = options.mapping || {};
    this.getHistoryState = options.getHistoryState || function () {
      return null;
    };
    this.threshold = options.threshold || 700;
    this.trackedParameters = options.trackedParameters || ['query', 'attribute:*', 'index', 'page', 'hitsPerPage'];

    this.searchParametersFromUrl = AlgoliaSearchHelper.getConfigurationFromQueryString(this.urlUtils.readUrl(), { mapping: this.mapping });
  }

  _createClass(URLSync, [{
    key: 'getConfiguration',
    value: function getConfiguration(currentConfiguration) {
      // we need to create a REAL helper to then get its state. Because some parameters
      // like hierarchicalFacet.rootPath are then triggering a default refinement that would
      // be not present if it was not going trough the SearchParameters constructor
      this.originalConfig = (0, _algoliasearchHelper2.default)({}, currentConfiguration.index, currentConfiguration).state;
      return this.searchParametersFromUrl;
    }
  }, {
    key: 'render',
    value: function render(_ref3) {
      var _this = this;

      var helper = _ref3.helper;

      if (firstRender) {
        firstRender = false;
        this.onHistoryChange(this.onPopState.bind(this, helper));
        helper.on('change', function (state) {
          return _this.renderURLFromState(state);
        });
      }
    }
  }, {
    key: 'onPopState',
    value: function onPopState(helper, fullState) {
      // compare with helper.state
      var partialHelperState = helper.getState(this.trackedParameters);
      var fullHelperState = (0, _assign2.default)({}, this.originalConfig, partialHelperState);

      if ((0, _isEqual2.default)(fullHelperState, fullState)) return;

      helper.overrideStateWithoutTriggeringChangeEvent(fullState).search();
    }
  }, {
    key: 'renderURLFromState',
    value: function renderURLFromState(state) {
      var currentQueryString = this.urlUtils.readUrl();
      var foreignConfig = AlgoliaSearchHelper.getForeignConfigurationInQueryString(currentQueryString, { mapping: this.mapping });
      // eslint-disable-next-line camelcase
      foreignConfig.is_v = majorVersionNumber;

      var qs = _url2.default.getQueryStringFromState(state.filter(this.trackedParameters), {
        moreAttributes: foreignConfig,
        mapping: this.mapping,
        safe: true
      });

      if (this.timer() < this.threshold) {
        this.urlUtils.replaceState(qs, { getHistoryState: this.getHistoryState });
      } else {
        this.urlUtils.pushState(qs, { getHistoryState: this.getHistoryState });
      }
    }

    // External API's

  }, {
    key: 'createURL',
    value: function createURL(state, _ref4) {
      var absolute = _ref4.absolute;

      var currentQueryString = this.urlUtils.readUrl();
      var filteredState = state.filter(this.trackedParameters);
      var foreignConfig = _algoliasearchHelper2.default.url.getUnrecognizedParametersInQueryString(currentQueryString, { mapping: this.mapping });
      // Add instantsearch version to reconciliate old url with newer versions
      // eslint-disable-next-line camelcase
      foreignConfig.is_v = majorVersionNumber;
      var relative = this.urlUtils.createURL(_algoliasearchHelper2.default.url.getQueryStringFromState(filteredState, { mapping: this.mapping }));

      return absolute ? getFullURL(relative) : relative;
    }
  }, {
    key: 'onHistoryChange',
    value: function onHistoryChange(fn) {
      var _this2 = this;

      this.urlUtils.onpopstate(function () {
        var qs = _this2.urlUtils.readUrl();
        var partialState = AlgoliaSearchHelper.getConfigurationFromQueryString(qs, { mapping: _this2.mapping });
        var fullState = (0, _assign2.default)({}, _this2.originalConfig, partialState);
        fn(fullState);
      });
    }
  }]);

  return URLSync;
}();

/**
 * Instanciate a url sync widget. This widget let you synchronize the search
 * parameters with the URL. It can operate with legacy API and hash or it can use
 * the modern history API. By default, it will use the modern API, but if you are
 * looking for compatibility with IE8 and IE9, then you should set 'useHash' to
 * true.
 * @param {object} options all the parameters to configure the URL synchronization. It
 * may contain the following keys :
 *  - threshold:number time in ms after which a new state is created in the browser
 * history. The default value is 700.
 *  - trackedParameters:string[] parameters that will be synchronized in the
 * URL. By default, it will track the query, all the refinable attribute (facets and numeric
 * filters), the index and the page.
 *  - useHash:boolean if set to true, the url will be hash based. Otherwise,
 * it'll use the query parameters using the modern history API.
 * @return {object} the widget instance
 */


function urlSync() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var useHash = options.useHash || false;

  var urlUtils = useHash ? hashUrlUtils : modernUrlUtils;

  return new URLSync(urlUtils, options);
}

exports.default = urlSync;