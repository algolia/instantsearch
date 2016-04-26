import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';
import forEach from 'lodash/collection/forEach';
import merge from 'lodash/object/merge';
import union from 'lodash/array/union';
import clone from 'lodash/lang/clone';
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
 * [Full documentation](https://community.algolia.com/algoliasearch-helper-js/docs/SearchParameters.html)
 * @param  {Object|boolean} [options.urlSync] Url synchronization configuration.
 * Setting to `true` will synchronize the needed search parameters with the browser url.
 * @param  {Object} [options.urlSync.mapping] Object used to define replacement query
 * parameter to use in place of another. Keys are current query parameters
 * and value the new value, e.g. `{ q: 'query' }`.
 * @param  {number} [options.urlSync.threshold] Time in ms after which a new
 * state is created in the browser history. The default value is 700.
 * @param  {string[]} [options.urlSync.trackedParameters] Parameters that will
 * be synchronized in the URL. By default, it will track the query, all the
 * refinable attribute (facets and numeric filters), the index and the page.
 * [Full documentation](https://community.algolia.com/algoliasearch-helper-js/docs/SearchParameters.html)
 * @param  {boolean} [options.urlSync.useHash] If set to true, the url will be
 * hash based. Otherwise, it'll use the query parameters using the modern
 * history API.
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
    searchFunction
  }) {
    super();
    if (appId === null || apiKey === null || indexName === null) {
      let usage = `
Usage: instantsearch({
  appId: 'my_application_id',
  apiKey: 'my_search_api_key',
  indexName: 'my_index_name'
});`;
      throw new Error(usage);
    }

    let client = algoliasearch(appId, apiKey);
    client.addAlgoliaAgent('instantsearch.js ' + version);

    this.client = client;
    this.helper = null;
    this.indexName = indexName;
    this.searchParameters = {...searchParameters, index: indexName};
    this.widgets = [];
    this.templatesConfig = {
      helpers: createHelpers({numberLocale}),
      compileOptions: {}
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

    let syncWidget;

    if (this.urlSync) {
      syncWidget = urlSyncWidget(this.urlSync);
      this._createURL = syncWidget.createURL.bind(syncWidget);
      this._onHistoryChange = syncWidget.onHistoryChange.bind(syncWidget);
    } else {
      this._createURL = defaultCreateURL;
      this._onHistoryChange = () => {};
    }

    this.searchParameters = this.widgets.reduce(enhanceConfiguration, this.searchParameters);

    let helper = algoliasearchHelper(
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

    if (this.urlSync) {
      helper.setState(enhanceConfiguration(helper.state, syncWidget));
      syncWidget.init({helper});
    }

    helper.on('result', this._render.bind(this, helper));
    helper.search();
  }

  _wrappedSearch() {
    let helper = clone(this.helper);
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
    forEach(this.widgets, function(widget) {
      if (!widget.render) {
        return;
      }
      widget.render({
        templatesConfig: this.templatesConfig,
        results,
        state,
        helper,
        createURL: this._createURL
      });
    }, this);
    this.emit('render');
  }

  _init(state, helper) {
    const {_onHistoryChange, templatesConfig} = this;
    forEach(this.widgets, function(widget) {
      if (widget.init) {
        widget.init({
          state,
          helper,
          templatesConfig,
          createURL: this._createURL,
          onHistoryChange: _onHistoryChange
        });
      }
    }, this);
  }
}

function enhanceConfiguration(configuration, widgetDefinition) {
  if (!widgetDefinition.getConfiguration) return configuration;

  // Update searchParameters with the configuration from the widgets
  let partialConfiguration = widgetDefinition.getConfiguration(configuration);
  return merge(
    {},
    configuration,
    partialConfiguration,
    (a, b) => {
      if (Array.isArray(a)) {
        return union(a, b);
      }
    }
  );
}

export default InstantSearch;
