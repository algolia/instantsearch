import algoliasearchHelper from 'algoliasearch-helper';
import version from '../lib/version.js';
import urlHelper from 'algoliasearch-helper/src/url';
import isEqual from 'lodash/isEqual';
import assign from 'lodash/assign';

const AlgoliaSearchHelper = algoliasearchHelper.AlgoliaSearchHelper;
const majorVersionNumber = version.split('.')[0];

function timerMaker(t0) {
  let t = t0;
  return function timer() {
    const now = Date.now();
    const delta = now - t;
    t = now;
    return delta;
  };
}

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
const hashUrlUtils = {
  ignoreNextPopState: false,
  character: '#',
  onpopstate(cb) {
    window.addEventListener('hashchange', hash => {
      if (this.ignoreNextPopState) {
        this.ignoreNextPopState = false;
        return;
      }

      cb(hash);
    });
  },
  pushState(qs) {
    // hash change or location assign does trigger an hashchange event
    // so everytime we change it manually, we inform the code
    // to ignore the next hashchange event
    // see https://github.com/algolia/instantsearch.js/issues/2012
    this.ignoreNextPopState = true;
    window.location.assign(getFullURL(this.createURL(qs)));
  },
  createURL(qs) {
    return window.location.search + this.character + qs;
  },
  readUrl() {
    return window.location.hash.slice(1);
  },
};

/**
 * Handles the modern API
 * @type {UrlUtil}
 */
const modernUrlUtils = {
  character: '?',
  onpopstate(cb) {
    window.addEventListener('popstate', cb);
  },
  pushState(qs, { getHistoryState }) {
    window.history.pushState(
      getHistoryState(),
      '',
      getFullURL(this.createURL(qs))
    );
  },
  createURL(qs) {
    return this.character + qs + document.location.hash;
  },
  readUrl() {
    return window.location.search.slice(1);
  },
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
  return `${window.location.protocol}//${window.location.hostname}${window
    .location.port
    ? `:${window.location.port}`
    : ''}`;
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
    this.trackedParameters = options.trackedParameters || [
      'query',
      'attribute:*',
      'index',
      'page',
      'hitsPerPage',
    ];
    this.firstRender = true;

    this.searchParametersFromUrl = AlgoliaSearchHelper.getConfigurationFromQueryString(
      this.urlUtils.readUrl(),
      { mapping: this.mapping }
    );
  }

  getConfiguration(currentConfiguration) {
    // we need to create a REAL helper to then get its state. Because some parameters
    // like hierarchicalFacet.rootPath are then triggering a default refinement that would
    // be not present if it was not going trough the SearchParameters constructor
    this.originalConfig = algoliasearchHelper(
      { addAlgoliaAgent() {} },
      currentConfiguration.index,
      currentConfiguration
    ).state;
    return this.searchParametersFromUrl;
  }

  render({ helper }) {
    if (this.firstRender) {
      this.firstRender = false;
      this.onHistoryChange(this.onPopState.bind(this, helper));
      helper.on('change', state => this.renderURLFromState(state));
    }
  }

  onPopState(helper, fullState) {
    clearTimeout(this.urlUpdateTimeout);
    // compare with helper.state
    const partialHelperState = helper.getState(this.trackedParameters);
    const fullHelperState = assign({}, this.originalConfig, partialHelperState);

    if (isEqual(fullHelperState, fullState)) return;

    helper.overrideStateWithoutTriggeringChangeEvent(fullState).search();
  }

  renderURLFromState(state) {
    const currentQueryString = this.urlUtils.readUrl();
    const foreignConfig = AlgoliaSearchHelper.getForeignConfigurationInQueryString(
      currentQueryString,
      { mapping: this.mapping }
    );
    // eslint-disable-next-line camelcase
    foreignConfig.is_v = majorVersionNumber;

    const qs = urlHelper.getQueryStringFromState(
      state.filter(this.trackedParameters),
      {
        moreAttributes: foreignConfig,
        mapping: this.mapping,
        safe: true,
      }
    );

    clearTimeout(this.urlUpdateTimeout);
    this.urlUpdateTimeout = setTimeout(() => {
      this.urlUtils.pushState(qs, { getHistoryState: this.getHistoryState });
    }, this.threshold);
  }

  // External API's

  createURL(state, { absolute }) {
    const currentQueryString = this.urlUtils.readUrl();
    const filteredState = state.filter(this.trackedParameters);
    const foreignConfig = algoliasearchHelper.url.getUnrecognizedParametersInQueryString(
      currentQueryString,
      { mapping: this.mapping }
    );
    // Add instantsearch version to reconciliate old url with newer versions
    // eslint-disable-next-line camelcase
    foreignConfig.is_v = majorVersionNumber;
    const relative = this.urlUtils.createURL(
      algoliasearchHelper.url.getQueryStringFromState(filteredState, {
        mapping: this.mapping,
      })
    );

    return absolute ? getFullURL(relative) : relative;
  }

  onHistoryChange(fn) {
    this.urlUtils.onpopstate(() => {
      const qs = this.urlUtils.readUrl();
      const partialState = AlgoliaSearchHelper.getConfigurationFromQueryString(
        qs,
        { mapping: this.mapping }
      );
      const fullState = assign({}, this.originalConfig, partialState);
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
  const useHash = options.useHash || false;

  const urlUtils = useHash ? hashUrlUtils : modernUrlUtils;

  return new URLSync(urlUtils, options);
}

export default urlSync;
