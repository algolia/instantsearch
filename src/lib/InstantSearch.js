// we use the full path to the lite build to solve a meteor.js issue:
// https://github.com/algolia/instantsearch.js/issues/1024#issuecomment-221618284
import algoliasearch from 'algoliasearch/src/browser/builds/algoliasearchLite.js';
import algoliasearchHelper from 'algoliasearch-helper';
import forEach from 'lodash/forEach';
import mergeWith from 'lodash/mergeWith';
import union from 'lodash/union';
import isPlainObject from 'lodash/isPlainObject';
import { EventEmitter } from 'events';
import urlSyncWidget from './url-sync.js';
import version from './version.js';
import createHelpers from './createHelpers.js';

function defaultCreateURL() {
  return '#';
}
const defaultCreateAlgoliaClient = (defaultAlgoliasearch, appId, apiKey) =>
  defaultAlgoliasearch(appId, apiKey);

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
    stalledSearchDelay = 200,
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
    this.searchParameters = { ...searchParameters, index: indexName };
    this.widgets = [];
    this.templatesConfig = {
      helpers: createHelpers({ numberLocale }),
      compileOptions: {},
    };
    this._stalledSearchDelay = stalledSearchDelay;

    if (searchFunction) {
      this._searchFunction = searchFunction;
    }

    this.urlSync = urlSync === true ? {} : urlSync;
  }

  /**
   * Add a widget. This can be done before and after InstantSearch has been started. Adding a
   * widget after InstantSearch started is considered **EXPERIMENTAL** and therefore
   * it is possibly buggy, if you find anything please
   * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20hot%20addWidget).
   * @param  {Widget} widget The widget to add to InstantSearch. Widgets are simple objects
   * that have methods that map the search life cycle in a UI perspective. Usually widgets are
   * created by [widget factories](widgets.html) like the one provided with InstantSearch.js.
   * @return {undefined} This method does not return anything
   */
  addWidget(widget) {
    this.addWidgets([widget]);
  }

  /**
   * Add multiple widgets. This can be done before and after the InstantSearch has been started. This feature
   * is considered **EXPERIMENTAL** and therefore it is possibly buggy, if you find anything please
   * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20addWidgets).
   * @param  {Widget[]} widgets The array of widgets to add to InstantSearch.
   * @return {undefined} This method does not return anything
   */
  addWidgets(widgets) {
    if (!Array.isArray(widgets)) {
      throw new Error(
        'You need to provide an array of widgets or call `addWidget()`'
      );
    }

    widgets.forEach(widget => {
      // Add the widget to the list of widget
      if (widget.render === undefined && widget.init === undefined) {
        throw new Error('Widget definition missing render or init method');
      }

      this.widgets.push(widget);
    });

    // Init the widget directly if instantsearch has been already started
    if (this.started) {
      this.searchParameters = this.widgets.reduce(enhanceConfiguration({}), {
        ...this.helper.state,
      });

      this.helper.setState(this.searchParameters);

      widgets.forEach(widget => {
        if (widget.init) {
          widget.init({
            state: this.helper.state,
            helper: this.helper,
            templatesConfig: this.templatesConfig,
            createURL: this._createAbsoluteURL,
            onHistoryChange: this._onHistoryChange,
            instantSearchInstance: this,
          });
        }
      });

      this.helper.search();
    }
  }

  /**
   * Removes a widget. This can be done after the InstantSearch has been started. This feature
   * is considered **EXPERIMENTAL** and therefore it is possibly buggy, if you find anything please
   * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20removeWidget).
   * @param  {Widget} widget The widget instance to remove from InstantSearch. This widget must implement a `dispose()` method in order to be gracefully removed.
   * @return {undefined} This method does not return anything
   */
  removeWidget(widget) {
    this.removeWidgets([widget]);
  }

  /**
   * Remove multiple widgets. This can be done only after the InstantSearch has been started. This feature
   * is considered **EXPERIMENTAL** and therefore it is possibly buggy, if you find anything please
   * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20addWidgets).
   * @param  {Widget[]} widgets Array of widgets instances to remove from InstantSearch.
   * @return {undefined} This method does not return anything
   */
  removeWidgets(widgets) {
    if (!Array.isArray(widgets)) {
      throw new Error(
        'You need to provide an array of widgets or call `removeWidget()`'
      );
    }

    widgets.forEach(widget => {
      if (
        !this.widgets.includes(widget) ||
        typeof widget.dispose !== 'function'
      ) {
        throw new Error(
          'The widget you tried to remove does not implement the dispose method, therefore it is not possible to remove this widget'
        );
      }

      this.widgets = this.widgets.filter(w => w !== widget);

      const nextState = widget.dispose({
        helper: this.helper,
        state: this.helper.getState(),
      });

      // re-compute remaining widgets to the state
      // in a case two widgets were using the same configuration but we removed one
      if (nextState) {
        // We don't want to re-add URlSync `getConfiguration` widget
        // it can throw errors since it may re-add SearchParameters about something unmounted
        this.searchParameters = this.widgets
          .filter(w => w.constructor.name !== 'URLSync')
          .reduce(enhanceConfiguration({}), { ...nextState });

        this.helper.setState(this.searchParameters);
      }
    });

    // no need to trigger a search if we don't have any widgets left
    if (this.widgets.length > 0) {
      this.helper.search();
    }
  }

  /**
   * The refresh method clears the cached answers from Algolia and triggers a new search.
   *
   * @return {undefined} Does not return anything
   */
  refresh() {
    if (this.helper) {
      this.helper.clearCache().search();
    }
  }

  /**
   * The start method ends the initialization of InstantSearch.js and triggers the
   * first search. This method should be called after all widgets have been added
   * to the instance of InstantSearch.js. InstantSearch.js also supports adding and removing
   * widgets after the start as an **EXPERIMENTAL** feature.
   *
   * @return {undefined} Does not return anything
   */
  start() {
    if (!this.widgets)
      throw new Error('No widgets were added to instantsearch.js');

    if (this.started) throw new Error('start() has been already called once');

    let searchParametersFromUrl;

    if (this.urlSync) {
      const syncWidget = urlSyncWidget(this.urlSync);
      this._createURL = syncWidget.createURL.bind(syncWidget);
      this._createAbsoluteURL = relative =>
        this._createURL(relative, { absolute: true });
      this._onHistoryChange = syncWidget.onHistoryChange.bind(syncWidget);
      this.widgets.push(syncWidget);
      searchParametersFromUrl = syncWidget.searchParametersFromUrl;
    } else {
      this._createURL = defaultCreateURL;
      this._createAbsoluteURL = defaultCreateURL;
      this._onHistoryChange = function() {};
    }

    this.searchParameters = this.widgets.reduce(
      enhanceConfiguration(searchParametersFromUrl),
      this.searchParameters
    );

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
    this.helper.on('error', e => {
      this.emit('error', e);
    });

    this._searchStalledTimer = null;
    this._isSearchStalled = true;

    this.helper.search();

    this.helper.on('search', () => {
      if (!this._isSearchStalled && !this._searchStalledTimer) {
        this._searchStalledTimer = setTimeout(() => {
          this._isSearchStalled = true;
          this._render(
            this.helper,
            this.helper.lastResults,
            this.helper.lastResults._state
          );
        }, this._stalledSearchDelay);
      }
    });

    // track we started the search if we add more widgets,
    // to init them directly after add
    this.started = true;
  }

  /**
   * Remove all widgets without triggering a search afterwards. This is an **EXPERIMENTAL** feature,
   * if you find an issue with it, please
   * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20dispose).
   * @return {undefined} This method does not return anything
   */
  dispose() {
    this.removeWidgets(this.widgets);
  }

  createURL(params) {
    if (!this._createURL) {
      throw new Error('You need to call start() before calling createURL()');
    }
    return this._createURL(this.helper.state.setQueryParameters(params));
  }

  _render(helper, results, state) {
    if (!this.helper.hasPendingRequests()) {
      clearTimeout(this._searchStalledTimer);
      this._searchStalledTimer = null;
      this._isSearchStalled = false;
    }

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
        searchMetadata: {
          isSearchStalled: this._isSearchStalled,
        },
      });
    });

    /**
     * Render is triggered when the rendering of the widgets has been completed
     * after a search.
     * @event InstantSearch#render
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
    const partialConfiguration = widgetDefinition.getConfiguration(
      configuration,
      searchParametersFromUrl
    );

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

    return mergeWith({}, configuration, partialConfiguration, customizer);
  };
}

export default InstantSearch;
