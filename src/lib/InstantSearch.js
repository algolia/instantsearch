// we use the fullpath to the lite build to solve a meteor.js issue:
// https://github.com/algolia/instantsearch.js/issues/1024#issuecomment-221618284
import algoliasearch from 'algoliasearch/src/browser/builds/algoliasearchLite.js';
import algoliasearchHelper from 'algoliasearch-helper';
import forEach from 'lodash/forEach';
import mergeWith from 'lodash/mergeWith';
import union from 'lodash/union';
import isPlainObject from 'lodash/isPlainObject';
import {EventEmitter} from 'events';
import urlSyncWidget from './url-sync.js';
import version from './version.js';
import createHelpers from './createHelpers.js';

function defaultCreateURL() { return '#'; }
const defaultCreateAlgoliaClient = (defaultAlgoliasearch, appId, apiKey) => defaultAlgoliasearch(appId, apiKey);

/**
 * Widgets are the building blocks of InstantSearch.js. Any
 * valid widget must have at least a `render` or a `init` function.
 * @typedef {Object} Widget
 * @property {function} [render] Called after each search response has been received
 * @property {function} [getConfiguration] Let the widget update the configuration
 * of the search with new parameters
 * @property {function} [init] Called once before the first search
 */

/**
 * The actual implementation of the InstantSearch. This is
 * created using the `instantsearch` factory function.
 * @fires Instantsearch#render This event is triggered each time a render is done
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
    createAlgoliaClient = defaultCreateAlgoliaClient,
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

    const client = createAlgoliaClient(algoliasearch, appId, apiKey);
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
   * @param  {Widget} widget The widget to add to InstantSearch. Widgets are simple objects
   * that have methods that map the search lifecycle in a UI perspective. Usually widgets are
   * created by [widget factories](widgets.html) like the one provided with InstantSearch.js.
   * @return {undefined} This method does not return anything
   */
  addWidget(widget) {
    // Add the widget to the list of widget
    if (widget.render === undefined && widget.init === undefined) {
      throw new Error('Widget definition missing render or init method');
    }

    this.widgets.push(widget);
  }

  /**
   * The start methods ends the initialization of InstantSearch.js and triggers the
   * first search. This method should be called after all widgets have been added
   * to the instance of InstantSearch.js
   *
   * @return {undefined} Does not return anything
   */
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
      this._mainHelperSearch = helper.search.bind(helper);
      helper.search = () => {
        const helperSearchFunction = algoliasearchHelper(
          {
            addAlgoliaAgent: () => {},
            search: () => {},
          },
          helper.state.index,
          helper.state
        );
        helperSearchFunction.once('search', state => {
          helper.overrideStateWithoutTriggeringChangeEvent(state);
          this._mainHelperSearch();
        });
        this._searchFunction(helperSearchFunction);
      };
    }

    this.helper = helper;
    this._init(helper.state, this.helper);
    this.helper.on('result', this._render.bind(this, this.helper));
    this.helper.search();
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
        instantSearchInstance: this,
      });
    });

    /**
     * Render is triggered when the rendering of the widgets has been completed
     * after a search.
     * @event IntantSearch#render
     */
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
          instantSearchInstance: this,
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
