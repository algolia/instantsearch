// we use the fullpath to the lite build to solve a meteor.js issue:
// https://github.com/algolia/instantsearch.js/issues/1024#issuecomment-221618284
import algoliasearch from 'algoliasearch/src/browser/builds/algoliasearchLite.js';
import algoliasearchHelper from 'algoliasearch-helper';
import forEach from 'lodash/forEach';
import mergeWith from 'lodash/mergeWith';
import union from 'lodash/union';
import clone from 'lodash/clone';
import isPlainObject from 'lodash/isPlainObject';
import {EventEmitter} from 'events';
import urlSyncWidget from './url-sync.js';
import version from './version.js';
import createHelpers from './createHelpers.js';

function defaultCreateURL() { return '#'; }

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
class InstantSearch extends EventEmitter {
  constructor({
    appId = null,
    apiKey = null,
    indexName = null,
    numberLocale,
    searchParameters = {},
    urlSync = null,
    searchFunction,
  }) {
    super();
    if (appId === null || apiKey === null || indexName === null) {
      const usage = `
Usage: instantsearch({
  appId: 'my_application_id',
  apiKey: 'my_search_api_key',
  indexName: 'my_index_name'
});`;
      throw new Error(usage);
    }

    const client = algoliasearch(appId, apiKey);
    client.addAlgoliaAgent(`instantsearch.js ${version}`);

    this.client = client;
    this.helper = null;
    this.indexName = indexName;
    this.searchParameters = {...searchParameters, index: indexName};
    this.widgets = [];
    this.templatesConfig = {
      helpers: createHelpers({numberLocale}),
      compileOptions: {},
    };

    if (searchFunction) {
      this._searchFunction = searchFunction;
    }

    this.urlSync = urlSync === true ? {} : urlSync;
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
  addWidget(widget) {
    // Add the widget to the list of widget
    if (widget.render === undefined && widget.init === undefined) {
      throw new Error('Widget definition missing render or init method');
    }

    this.widgets.push(widget);
  }

  start() {
    if (!this.widgets) throw new Error('No widgets were added to instantsearch.js');

    let searchParametersFromUrl;

    if (this.urlSync) {
      const syncWidget = urlSyncWidget(this.urlSync);
      this._createURL = syncWidget.createURL.bind(syncWidget);
      this._createAbsoluteURL = relative => this._createURL(relative, {absolute: true});
      this._onHistoryChange = syncWidget.onHistoryChange.bind(syncWidget);
      this.widgets.push(syncWidget);
      searchParametersFromUrl = syncWidget.searchParametersFromUrl;
    } else {
      this._createURL = defaultCreateURL;
      this._createAbsoluteURL = defaultCreateURL;
      this._onHistoryChange = function() {};
    }

    this.searchParameters = this.widgets.reduce(enhanceConfiguration(searchParametersFromUrl), this.searchParameters);

    const helper = algoliasearchHelper(
      this.client,
      this.searchParameters.index || this.indexName,
      this.searchParameters
    );

    if (this._searchFunction) {
      this._originalHelperSearch = helper.search.bind(helper);
      helper.search = this._wrappedSearch.bind(this);
    }

    this.helper = helper;

    this._init(helper.state, helper);

    helper.on('result', this._render.bind(this, helper));
    helper.search();
  }

  _wrappedSearch() {
    const helper = clone(this.helper);
    helper.search = this._originalHelperSearch;
    this._searchFunction(helper);
    return;
  }

  createURL(params) {
    if (!this._createURL) {
      throw new Error('You need to call start() before calling createURL()');
    }
    return this._createURL(this.helper.state.setQueryParameters(params));
  }

  _render(helper, results, state) {
    forEach(this.widgets, widget => {
      if (!widget.render) {
        return;
      }
      widget.render({
        templatesConfig: this.templatesConfig,
        results,
        state,
        helper,
        createURL: this._createAbsoluteURL,
      });
    });
    this.emit('render');
  }

  _init(state, helper) {
    forEach(this.widgets, widget => {
      if (widget.init) {
        widget.init({
          state,
          helper,
          templatesConfig: this.templatesConfig,
          createURL: this._createAbsoluteURL,
          onHistoryChange: this._onHistoryChange,
        });
      }
    });
  }
}

function enhanceConfiguration(searchParametersFromUrl) {
  return (configuration, widgetDefinition) => {
    if (!widgetDefinition.getConfiguration) return configuration;

    // Get the relevant partial configuration asked by the widget
    const partialConfiguration = widgetDefinition.getConfiguration(configuration, searchParametersFromUrl);

    const customizer = (a, b) => {
      // always create a unified array for facets refinements
      if (Array.isArray(a)) {
        return union(a, b);
      }

      // avoid mutating objects
      if (isPlainObject(a)) {
        return mergeWith({}, a, b, customizer);
      }

      return undefined;
    };

    return mergeWith(
      {},
      configuration,
      partialConfiguration,
      customizer
    );
  };
}

export default InstantSearch;
