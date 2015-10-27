var algoliasearchHelper = require('algoliasearch-helper');
var AlgoliaSearchHelper = algoliasearchHelper.AlgoliaSearchHelper;
var majorVersionNumber = require('../lib/version.js').split('.')[0];

var isEqual = require('lodash/lang/isEqual');
var merge = require('lodash/object/merge');

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
  onpopstate: function(cb) {
    window.addEventListener('hashchange', cb);
  },
  pushState: function(qs) {
    window.location.assign(this.createURL(qs));
  },
  replaceState: function(qs) {
    window.location.replace(this.createURL(qs));
  },
  createURL: function(qs) {
    return document.location.search + this.character + qs;
  },
  readUrl: function() {
    return window.location.hash.slice(1);
  }
};

/**
 * Handles the modern API
 * @type {UrlUtil}
 */
var modernUrlUtils = {
  character: '?',
  onpopstate: function(cb) {
    window.addEventListener('popstate', cb);
  },
  pushState: function(qs) {
    window.history.pushState(null, '', this.createURL(qs));
  },
  replaceState: function(qs) {
    window.history.replaceState(null, '', this.createURL(qs));
  },
  createURL: function(qs) {
    return this.character + qs + document.location.hash;
  },
  readUrl: function() {
    return window.location.search.slice(1);
  }
};

/**
 * Instanciate a url sync widget. This widget let you synchronize the search
 * parameters with the URL. It can operate with legacy API and hash or it can use
 * the modern history API. By default, it will use the modern API, but if you are
 * looking for compatibility with IE8 and IE9, then you should set 'useHash' to
 * true.
 * @class
 * @param {UrlUtil} urlUtils an object containing the function to read, watch the changes
 * and update the URL.
 * @param {object} options may contain the following keys :
 *  - threshold:number time in ms after which a new state is created in the browser
 * history. The default value is 700.
 *  - trackedParameters:string[] parameters that will be synchronized in the
 * URL. By default, it will track the query, all the refinable attribute (facets and numeric
 * filters), the index and the page.
 *  - useHash:boolean if set to true, the url will be hash based. Otherwise,
 * it'll use the query parameters using the modern history API.
 */
class URLSync {
  constructor(urlUtils, options) {
    this.__initLast = true;
    this.urlUtils = urlUtils;
    this.originalConfig = null;
    this.timer = timerMaker(Date.now());
    this.threshold = options.threshold || 700;
    this.trackedParameters = options.trackedParameters || ['query', 'attribute:*', 'index', 'page', 'hitsPerPage'];
  }

  getConfiguration(currentConfiguration) {
    this.originalConfig = currentConfiguration;
    var queryString = this.urlUtils.readUrl();
    var config = AlgoliaSearchHelper.getConfigurationFromQueryString(queryString);
    return config;
  }

  onPopState(helper) {
    var qs = this.urlUtils.readUrl();
    var partialState = AlgoliaSearchHelper.getConfigurationFromQueryString(qs);
    var fullState = merge({}, this.originalConfig, partialState);
    // compare with helper.state
    var partialHelperState = helper.getState(this.trackedParameters);
    var fullHelperState = merge({}, this.originalConfig, partialHelperState);

    if (isEqual(fullHelperState, fullState)) return;

    helper.setState(fullState).search();
  }

  init(state, helper) {
    this.urlUtils.onpopstate(this.onPopState.bind(this, helper));
  }

  render({helper}) {
    var helperState = helper.getState(this.trackedParameters);
    var currentQueryString = this.urlUtils.readUrl();
    var urlState = AlgoliaSearchHelper.getConfigurationFromQueryString(currentQueryString);

    if (isEqual(helperState, urlState)) return;

    // Add instantsearch version to reconciliate old url with newer versions
    var foreignConfig = AlgoliaSearchHelper.getForeignConfigurationInQueryString(currentQueryString);
    foreignConfig.is_v = majorVersionNumber;

    var qs = helper.getStateAsQueryString({filters: this.trackedParameters, moreAttributes: foreignConfig});
    if (this.timer() < this.threshold) {
      this.urlUtils.replaceState(qs);
    } else {
      this.urlUtils.pushState(qs);
    }
  }

  createURL(state) {
    var currentQueryString = this.urlUtils.readUrl();
    var filteredState = state.filter(this.trackedParameters);
    var foreignConfig = algoliasearchHelper.url.getUnrecognizedParametersInQueryString(currentQueryString);
    // Add instantsearch version to reconciliate old url with newer versions
    foreignConfig.is_v = majorVersionNumber;

    return this.urlUtils.createURL(algoliasearchHelper.url.getQueryStringFromState(filteredState));
  }
}

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
function urlSync(options = {}) {
  var useHash = options.useHash || false;

  var urlUtils = useHash ? hashUrlUtils : modernUrlUtils;

  return new URLSync(urlUtils, options);
}


module.exports = urlSync;
