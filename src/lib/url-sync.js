import algoliasearchHelper from 'algoliasearch-helper';
let AlgoliaSearchHelper = algoliasearchHelper.AlgoliaSearchHelper;
let majorVersionNumber = require('../lib/version.js').split('.')[0];
import urlHelper from 'algoliasearch-helper/src/url';

import {isEqual, merge, debounce} from 'lodash';

/**
 * @typedef {object} UrlUtil
 * @property {string} character the character used in the url
 * @property {function} onpopstate add an event listener for the URL change
 * @property {function} pushState creates a new entry in the browser history
 * @property {function} readUrl reads the query string of the parameters
 */

/**
 * Handles the legacy browsers
 * @type {UrlUtil}
 */
let hashUrlUtils = {
  character: '#',
  onpopstate: function(cb) {
    window.addEventListener('hashchange', cb);
  },
  pushState: function(qs) {
    window.location.assign(this.createURL(qs));
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
let modernUrlUtils = {
  character: '?',
  onpopstate: function(cb) {
    window.addEventListener('popstate', cb);
  },
  pushState: function(qs) {
    window.history.pushState(null, '', this.createURL(qs));
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
    this.urlUtils = urlUtils;
    this.originalConfig = null;
    this.threshold = options.threshold || 700;
    this.trackedParameters = options.trackedParameters || ['query', 'attribute:*', 'index', 'page', 'hitsPerPage'];
    this.renderURLFromState = debounce(
      this.renderURLFromState,
      this.threshold, {
        leading: true,
        trailing: true
      }
    );
  }

  getConfiguration(currentConfiguration) {
    this.originalConfig = currentConfiguration;
    let queryString = this.urlUtils.readUrl();
    let config = AlgoliaSearchHelper.getConfigurationFromQueryString(queryString);
    return config;
  }

  init({helper}) {
    helper.on('change', this.renderURLFromState.bind(this));
    this.onHistoryChange(this.onPopState.bind(this, helper));
  }

  onPopState(helper, fullState) {
    // compare with helper.state
    let partialHelperState = helper.getState(this.trackedParameters);
    let fullHelperState = merge({}, this.originalConfig, partialHelperState);

    if (isEqual(fullHelperState, fullState)) return;

    helper.overrideStateWithoutTriggeringChangeEvent(fullState).search();
  }

  renderURLFromState(state) {
    let currentQueryString = this.urlUtils.readUrl();
    let foreignConfig = AlgoliaSearchHelper.getForeignConfigurationInQueryString(currentQueryString);
    foreignConfig.is_v = majorVersionNumber;

    let qs = urlHelper.getQueryStringFromState(
      state.filter(this.trackedParameters),
      {moreAttributes: foreignConfig}
    );

    this.urlUtils.pushState(qs);
  }

  // External API's

  createURL(state) {
    let currentQueryString = this.urlUtils.readUrl();
    let filteredState = state.filter(this.trackedParameters);
    let foreignConfig = algoliasearchHelper.url.getUnrecognizedParametersInQueryString(currentQueryString);
    // Add instantsearch version to reconciliate old url with newer versions
    foreignConfig.is_v = majorVersionNumber;

    return this.urlUtils.createURL(algoliasearchHelper.url.getQueryStringFromState(filteredState));
  }

  onHistoryChange(fn) {
    this.urlUtils.onpopstate(() => {
      let qs = this.urlUtils.readUrl();
      let partialState = AlgoliaSearchHelper.getConfigurationFromQueryString(qs);
      let fullState = merge({}, this.originalConfig, partialState);
      fn(fullState);
    });
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
  let useHash = options.useHash || false;

  let urlUtils = useHash ? hashUrlUtils : modernUrlUtils;

  return new URLSync(urlUtils, options);
}


export default urlSync;
