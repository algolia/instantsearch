import algoliasearchHelper from 'algoliasearch-helper';
import version from '../lib/version.js';
import urlHelper from 'algoliasearch-helper/src/url';
import isEqual from 'lodash/lang/isEqual';
import merge from 'lodash/object/merge';/**/

let AlgoliaSearchHelper = algoliasearchHelper.AlgoliaSearchHelper;
let majorVersionNumber = version.split('.')[0];
let firstRender = true;

function timerMaker(t0) {
  let t = t0;
  return function timer() {
    let now = Date.now();
    let delta = now - t;
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
let hashUrlUtils = {
  character: '#',
  onpopstate: function(cb) {
    window.addEventListener('hashchange', cb);
  },
  pushState: function(qs) {
    window.location.assign(getFullURL(this.createURL(qs)));
  },
  replaceState: function(qs) {
    window.location.replace(getFullURL(this.createURL(qs)));
  },
  createURL: function(qs) {
    return window.location.search + this.character + qs;
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
  pushState: function(qs, {getHistoryState}) {
    window.history.pushState(getHistoryState(), '', getFullURL(this.createURL(qs)));
  },
  replaceState: function(qs, {getHistoryState}) {
    window.history.replaceState(getHistoryState(), '', getFullURL(this.createURL(qs)));
  },
  createURL: function(qs) {
    return this.character + qs + document.location.hash;
  },
  readUrl: function() {
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
  return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
}

// see InstantSearch.js file for urlSync options
class URLSync {
  constructor(urlUtils, options) {
    this.urlUtils = urlUtils;
    this.originalConfig = null;
    this.timer = timerMaker(Date.now());
    this.mapping = options.mapping || {};
    this.getHistoryState = options.getHistoryState || (() => null);
    this.threshold = options.threshold || 700;
    this.trackedParameters = options.trackedParameters || ['query', 'attribute:*', 'index', 'page', 'hitsPerPage'];
  }

  getConfiguration(currentConfiguration) {
    // we need to create a REAL helper to then get its state. Because some parameters
    // like hierarchicalFacet.rootPath are then triggering a default refinement that would
    // be not present if it was not going trough the SearchParameters constructor
    this.originalConfig = algoliasearchHelper({}, currentConfiguration.index, currentConfiguration).state;
    let queryString = this.urlUtils.readUrl();
    let config = AlgoliaSearchHelper.getConfigurationFromQueryString(queryString, {mapping: this.mapping});
    return config;
  }

  render({helper}) {
    if (firstRender) {
      firstRender = false;
      this.onHistoryChange(this.onPopState.bind(this, helper));
      helper.on('change', state => this.renderURLFromState(state));
    }
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
    let foreignConfig = AlgoliaSearchHelper.getForeignConfigurationInQueryString(currentQueryString, {mapping: this.mapping});
    foreignConfig.is_v = majorVersionNumber;

    let qs = urlHelper.getQueryStringFromState(
      state.filter(this.trackedParameters),
      {
        moreAttributes: foreignConfig,
        mapping: this.mapping
      }
    );

    if (this.timer() < this.threshold) {
      this.urlUtils.replaceState(qs, {getHistoryState: this.getHistoryState});
    } else {
      this.urlUtils.pushState(qs, {getHistoryState: this.getHistoryState});
    }
  }

  // External API's

  createURL(state, {absolute}) {
    let currentQueryString = this.urlUtils.readUrl();
    let filteredState = state.filter(this.trackedParameters);
    let foreignConfig = algoliasearchHelper.url.getUnrecognizedParametersInQueryString(currentQueryString, {mapping: this.mapping});
    // Add instantsearch version to reconciliate old url with newer versions
    foreignConfig.is_v = majorVersionNumber;
    const relative = this.urlUtils.createURL(algoliasearchHelper.url.getQueryStringFromState(filteredState, {mapping: this.mapping}));

    return absolute ? getFullURL(relative) : relative;
  }

  onHistoryChange(fn) {
    this.urlUtils.onpopstate(() => {
      let qs = this.urlUtils.readUrl();
      let partialState = AlgoliaSearchHelper.getConfigurationFromQueryString(qs, {mapping: this.mapping});
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
