import algoliasearchHelper from 'algoliasearch-helper';
import EventEmitter from 'events';
import index from '../widgets/index/index';
import RoutingManager from './RoutingManager';
import simpleMapping from './stateMappings/simple';
import historyRouter from './routers/history';
import version from './version';
import createHelpers from './createHelpers';
import {
  createDocumentationMessageGenerator,
  isPlainObject,
  defer,
  noop,
} from './utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'instantsearch',
});

const ROUTING_DEFAULT_OPTIONS = {
  stateMapping: simpleMapping(),
  router: historyRouter(),
};

function defaultCreateURL() {
  return '#';
}

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
  constructor(options) {
    super();

    const {
      indexName = null,
      numberLocale,
      searchParameters = {},
      routing = null,
      searchFunction,
      stalledSearchDelay = 200,
      searchClient = null,
      insightsClient = null,
    } = options;

    if (indexName === null) {
      throw new Error(withUsage('The `indexName` option is required.'));
    }

    if (searchClient === null) {
      throw new Error(withUsage('The `searchClient` option is required.'));
    }

    if (typeof options.urlSync !== 'undefined') {
      throw new Error(
        withUsage(
          'The `urlSync` option was removed in InstantSearch.js 3. You may want to use the `routing` option.'
        )
      );
    }

    if (typeof searchClient.search !== 'function') {
      throw new Error(
        `The \`searchClient\` must implement a \`search\` method.

See: https://www.algolia.com/doc/guides/building-search-ui/going-further/backend-search/in-depth/backend-instantsearch/js/`
      );
    }

    if (typeof searchClient.addAlgoliaAgent === 'function') {
      searchClient.addAlgoliaAgent(`instantsearch.js (${version})`);
    }

    if (insightsClient && typeof insightsClient !== 'function') {
      throw new Error(
        withUsage('The `insightsClient` option should be a function.')
      );
    }

    this.client = searchClient;
    this.insightsClient = insightsClient;

    this.indexName = indexName;
    this.helper = null;
    this.mainHelper = null;
    this.mainIndex = index({
      indexName,
    });

    this.started = false;
    this.templatesConfig = {
      helpers: createHelpers({ numberLocale }),
      compileOptions: {},
    };

    this._stalledSearchDelay = stalledSearchDelay;
    this._searchStalledTimer = null;
    this._isSearchStalled = true;
    this._searchParameters = {
      ...searchParameters,
      index: indexName,
    };

    if (searchFunction) {
      this._searchFunction = searchFunction;
    }

    if (routing === true) {
      this.routing = ROUTING_DEFAULT_OPTIONS;
    } else if (isPlainObject(routing)) {
      this.routing = {
        ...ROUTING_DEFAULT_OPTIONS,
        ...routing,
      };
    }
  }

  /**
   * Adds a widget. This can be done before and after InstantSearch has been started. Adding a
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
   * Adds multiple widgets. This can be done before and after the InstantSearch has been started. This feature
   * is considered **EXPERIMENTAL** and therefore it is possibly buggy, if you find anything please
   * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20addWidgets).
   * @param  {Widget[]} widgets The array of widgets to add to InstantSearch.
   * @return {undefined} This method does not return anything
   */
  addWidgets(widgets) {
    if (!Array.isArray(widgets)) {
      throw new Error(
        withUsage(
          'The `addWidgets` method expects an array of widgets. Please use `addWidget`.'
        )
      );
    }

    if (
      widgets.some(
        widget =>
          typeof widget.init !== 'function' &&
          typeof widget.render !== 'function'
      )
    ) {
      throw new Error(
        withUsage(
          'The widget definition expects a `render` and/or an `init` method.'
        )
      );
    }

    this.mainIndex.addWidgets(widgets);
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
   * Removes multiple widgets. This can be done only after the InstantSearch has been started. This feature
   * is considered **EXPERIMENTAL** and therefore it is possibly buggy, if you find anything please
   * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20addWidgets).
   * @param  {Widget[]} widgets Array of widgets instances to remove from InstantSearch.
   * @return {undefined} This method does not return anything
   */
  removeWidgets(widgets) {
    if (!Array.isArray(widgets)) {
      throw new Error(
        withUsage(
          'The `removeWidgets` method expects an array of widgets. Please use `removeWidget`.'
        )
      );
    }

    if (widgets.some(widget => typeof widget.dispose !== 'function')) {
      throw new Error(
        withUsage('The widget definition expects a `dispose` method.')
      );
    }

    this.mainIndex.removeWidgets(widgets);
  }

  /**
   * Ends the initialization of InstantSearch.js and triggers the
   * first search. This method should be called after all widgets have been added
   * to the instance of InstantSearch.js. InstantSearch.js also supports adding and removing
   * widgets after the start as an **EXPERIMENTAL** feature.
   *
   * @return {undefined} Does not return anything
   */
  start() {
    if (this.started) {
      throw new Error(
        withUsage('The `start` method has already been called once.')
      );
    }

    if (this.routing) {
      const routingManager = new RoutingManager({
        ...this.routing,
        instantSearchInstance: this,
      });
      this._onHistoryChange = routingManager.onHistoryChange.bind(
        routingManager
      );
      this._createURL = routingManager.createURL.bind(routingManager);
      this._createAbsoluteURL = this._createURL;
      // We don't use `addWidgets` because we have to ensure that `RoutingManager`
      // is the last widget added. Otherwise we have an issue with the `routing`.
      // https://github.com/algolia/instantsearch.js/pull/3149
      this.mainIndex.getWidgets().push(routingManager);
    } else {
      this._createURL = defaultCreateURL;
      this._createAbsoluteURL = defaultCreateURL;
      this._onHistoryChange = noop;
    }

    // This Helper is used for the queries, we don't care about its state. The
    // states are managed at the `index` level. We use this Helper to create
    // DerivedHelper scoped into the `index` widgets.
    const mainHelper = algoliasearchHelper(this.client);

    mainHelper.search = () => {
      // This solution allows us to keep the exact same API for the users but
      // under the hood, we have a different implementation. It should be
      // completely transparent for the rest of the codebase. Only this module
      // is impacted.
      return mainHelper.searchOnlyWithDerivedHelpers();
    };

    if (this._searchFunction) {
      this._mainHelperSearch = mainHelper.search.bind(mainHelper);
      mainHelper.search = () => {
        const mainIndexHelper = this.mainIndex.getHelper();
        const searchFunctionHelper = algoliasearchHelper(
          {
            search: () => new Promise(noop),
          },
          mainIndexHelper.state.index,
          mainIndexHelper.state
        );
        searchFunctionHelper.once('search', ({ state }) => {
          mainIndexHelper.overrideStateWithoutTriggeringChangeEvent(state);
          this._mainHelperSearch();
        });
        this._searchFunction(searchFunctionHelper);
        return mainHelper;
      };
    }

    // Only the "main" Helper emits the `error` event vs the one for `search`
    // and `results` that are also emitted on the derived one.
    mainHelper.on('error', ({ error }) => {
      this.emit('error', {
        error,
      });
    });

    this.mainHelper = mainHelper;

    this.mainIndex.init({
      instantSearchInstance: this,
      parent: null,
    });

    mainHelper.search();

    // Keep the previous reference for legacy purpose, some pattern use
    // the direct Helper access `search.helper` (e.g mutli-index).
    this.helper = this.mainIndex.getHelper();

    // track we started the search if we add more widgets,
    // to init them directly after add
    this.started = true;
  }

  /**
   * Removes all widgets without triggering a search afterwards. This is an **EXPERIMENTAL** feature,
   * if you find an issue with it, please
   * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20dispose).
   * @return {undefined} This method does not return anything
   */
  dispose() {
    this.scheduleRender.cancel();

    this.removeWidgets(this.mainIndex.getWidgets());
    this.mainIndex.dispose();

    // You can not start an instance two times, therefore a disposed instance
    // needs to set started as false otherwise this can not be restarted at a
    // later point.
    this.started = false;

    // The helper needs to be reset to perform the next search from a fresh state.
    // If not reset, it would use the state stored before calling `dispose()`.
    this.removeAllListeners();
    this.mainHelper.removeAllListeners();
    this.mainHelper = null;
    this.helper = null;
  }

  scheduleSearch = defer(() => {
    this.mainHelper.search();
  });

  scheduleRender = defer(() => {
    if (!this.mainHelper.hasPendingRequests()) {
      clearTimeout(this._searchStalledTimer);
      this._searchStalledTimer = null;
      this._isSearchStalled = false;
    }

    this.mainIndex.render({
      instantSearchInstance: this,
    });

    this.emit('render');
  });

  scheduleStalledRender() {
    if (!this._isSearchStalled && !this._searchStalledTimer) {
      this._searchStalledTimer = setTimeout(() => {
        this._isSearchStalled = true;
        this.scheduleRender();
      }, this._stalledSearchDelay);
    }
  }

  createURL(params) {
    if (!this._createURL) {
      throw new Error(
        withUsage('The `start` method needs to be called before `createURL`.')
      );
    }

    return this._createURL(
      this.mainIndex.getHelper().state.setQueryParameters(params)
    );
  }

  refresh() {
    if (!this.mainHelper) {
      throw new Error(
        withUsage('The `start` method needs to be called before `refresh`.')
      );
    }

    this.mainHelper.clearCache().search();
  }
}

export default InstantSearch;
