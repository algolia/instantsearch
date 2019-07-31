import algoliasearchHelper, {
  AlgoliaSearchHelper,
  SearchParameters,
  PlainSearchParameters,
} from 'algoliasearch-helper';
import { Client as AlgoliaSearchClient } from 'algoliasearch';
import EventEmitter from 'events';
import index, { Index } from '../widgets/index/index';
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
import {
  InsightsClient as AlgoliaInsightsClient,
  SearchClient,
  Widget,
  StateMapping,
  Router,
  UiState,
} from '../types';

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

export type Routing<TRouteState = UiState> = {
  router: Router<TRouteState>;
  stateMapping: StateMapping<TRouteState>;
};

/**
 * Global options for an InstantSearch instance.
 */
export type InstantSearchOptions<TRouteState = UiState> = {
  /**
   * The name of the main index
   */
  indexName: string;

  /**
   * The search client to plug to InstantSearch.js
   *
   * Usage:
   * ```javascript
   * // Using the default Algolia search client
   * instantsearch({
   *   indexName: 'indexName',
   *   searchClient: algoliasearch('appId', 'apiKey')
   * });
   *
   * // Using a custom search client
   * instantsearch({
   *   indexName: 'indexName',
   *   searchClient: {
   *     search(requests) {
   *       // fetch response based on requests
   *       return response;
   *     },
   *     searchForFacetValues(requests) {
   *       // fetch response based on requests
   *       return response;
   *     }
   *   }
   * });
   * ```
   */
  searchClient: SearchClient | AlgoliaSearchClient;

  /**
   * The locale used to display numbers. This will be passed
   * to `Number.prototype.toLocaleString()`
   */
  numberLocale?: string;

  /**
   * A hook that will be called each time a search needs to be done, with the
   * helper as a parameter. It's your responsibility to call `helper.search()`.
   * This option allows you to avoid doing searches at page load for example.
   */
  searchFunction?: (helper: AlgoliaSearchHelper) => void;

  /**
   * Additional parameters to unconditionally pass to the Algolia API. See also
   * the `configure` widget for dynamically passing search parameters.
   */
  searchParameters?: PlainSearchParameters;

  /**
   * Time before a search is considered stalled. The default is 200ms
   */
  stalledSearchDelay?: number;

  /**
   * Router configuration used to save the UI State into the URL or any other
   * client side persistence. Passing `true` will use the default URL options.
   */
  routing?: Partial<Routing<TRouteState>> | boolean;

  /**
   * the instance of search-insights to use for sending insights events inside
   * widgets like `hits`.
   */
  insightsClient?: AlgoliaInsightsClient;
};

/**
 * The actual implementation of the InstantSearch. This is
 * created using the `instantsearch` factory function.
 * It emits the 'render' event every time a search is done
 */
class InstantSearch extends EventEmitter {
  public client: InstantSearchOptions['searchClient'];
  public indexName: string;
  public insightsClient: AlgoliaInsightsClient | null;
  public helper: AlgoliaSearchHelper | null;
  public mainHelper: AlgoliaSearchHelper | null;
  public mainIndex: Index;
  public started: boolean;
  public templatesConfig: object;
  public _stalledSearchDelay: number;
  public _searchStalledTimer: any;
  public _isSearchStalled: boolean;
  public _searchParameters: PlainSearchParameters;
  public _searchFunction?: InstantSearchOptions['searchFunction'];
  public _createURL?: (params: SearchParameters) => string;
  public _createAbsoluteURL?: (params: SearchParameters) => string;
  public _mainHelperSearch?: AlgoliaSearchHelper['search'];
  public routing?: Routing;

  public constructor(options: InstantSearchOptions) {
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

    if (typeof (options as any).urlSync !== 'undefined') {
      throw new Error(
        withUsage(
          'The `urlSync` option was removed in InstantSearch.js 3. You may want to use the `routing` option.'
        )
      );
    }

    if (typeof (searchClient as any).search !== 'function') {
      throw new Error(
        `The \`searchClient\` must implement a \`search\` method.

See: https://www.algolia.com/doc/guides/building-search-ui/going-further/backend-search/in-depth/backend-instantsearch/js/`
      );
    }

    if (
      typeof (searchClient as AlgoliaSearchClient).addAlgoliaAgent ===
      'function'
    ) {
      (searchClient as AlgoliaSearchClient).addAlgoliaAgent(
        `instantsearch.js (${version})`
      );
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
    this._isSearchStalled = false;
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
   * @param  widget The widget to add to InstantSearch. Widgets are simple objects
   * that have methods that map the search life cycle in a UI perspective. Usually widgets are
   * created by [widget factories](widgets.html) like the one provided with InstantSearch.js.
   */
  public addWidget(widget: Widget) {
    this.addWidgets([widget]);
  }

  /**
   * Adds multiple widgets. This can be done before and after the InstantSearch has been started. This feature
   * is considered **EXPERIMENTAL** and therefore it is possibly buggy, if you find anything please
   * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20addWidgets).
   * @param {Widget[]} widgets The array of widgets to add to InstantSearch.
   */
  public addWidgets(widgets: Widget[]) {
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
   */
  public removeWidget(widget: Widget) {
    this.removeWidgets([widget]);
  }

  /**
   * Removes multiple widgets. This can be done only after the InstantSearch has been started. This feature
   * is considered **EXPERIMENTAL** and therefore it is possibly buggy, if you find anything please
   * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20addWidgets).
   * @param {Widget[]} widgets Array of widgets instances to remove from InstantSearch.
   */
  public removeWidgets(widgets: Widget[]) {
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
   */
  public start() {
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
      this._createURL = routingManager.createURL.bind(routingManager);
      this._createAbsoluteURL = this._createURL;
      // We don't use `addWidgets` because we have to ensure that `RoutingManager`
      // is the last widget added. Otherwise we have an issue with the `routing`.
      // https://github.com/algolia/instantsearch.js/pull/3149
      this.mainIndex.getWidgets().push(routingManager);
    } else {
      this._createURL = defaultCreateURL;
      this._createAbsoluteURL = defaultCreateURL;
    }

    // This Helper is used for the queries, we don't care about its state. The
    // states are managed at the `index` level. We use this Helper to create
    // DerivedHelper scoped into the `index` widgets.
    const mainHelper = algoliasearchHelper(this.client, this.indexName);

    mainHelper.search = () => {
      // This solution allows us to keep the exact same API for the users but
      // under the hood, we have a different implementation. It should be
      // completely transparent for the rest of the codebase. Only this module
      // is impacted.
      return mainHelper.searchOnlyWithDerivedHelpers();
    };

    if (this._searchFunction) {
      // this client isn't used to actually search, but required for the helper
      // to not throw errors
      const fakeClient = ({
        search: () => new Promise(noop),
      } as any) as AlgoliaSearchClient;

      this._mainHelperSearch = mainHelper.search.bind(mainHelper);
      mainHelper.search = () => {
        const mainIndexHelper = this.mainIndex.getHelper();
        const searchFunctionHelper = algoliasearchHelper(
          fakeClient,
          mainIndexHelper!.state.index,
          mainIndexHelper!.state
        );
        searchFunctionHelper.once('search', ({ state }) => {
          mainIndexHelper!.overrideStateWithoutTriggeringChangeEvent(state);
          this._mainHelperSearch!();
        });
        this._searchFunction!(searchFunctionHelper);
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
    // the direct Helper access `search.helper` (e.g multi-index).
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
  public dispose(): void {
    this.scheduleSearch.cancel();
    this.scheduleRender.cancel();
    clearTimeout(this._searchStalledTimer);

    this.removeWidgets(this.mainIndex.getWidgets());
    this.mainIndex.dispose();

    // You can not start an instance two times, therefore a disposed instance
    // needs to set started as false otherwise this can not be restarted at a
    // later point.
    this.started = false;

    // The helper needs to be reset to perform the next search from a fresh state.
    // If not reset, it would use the state stored before calling `dispose()`.
    this.removeAllListeners();
    this.mainHelper!.removeAllListeners();
    this.mainHelper = null;
    this.helper = null;
  }

  public scheduleSearch = defer(() => {
    this.mainHelper!.search();
  });

  public scheduleRender = defer(() => {
    if (!this.mainHelper!.hasPendingRequests()) {
      clearTimeout(this._searchStalledTimer);
      this._searchStalledTimer = null;
      this._isSearchStalled = false;
    }

    this.mainIndex.render({
      instantSearchInstance: this,
    });

    this.emit('render');
  });

  public scheduleStalledRender() {
    if (!this._searchStalledTimer) {
      this._searchStalledTimer = setTimeout(() => {
        this._isSearchStalled = true;
        this.scheduleRender();
      }, this._stalledSearchDelay);
    }
  }

  public createURL(params: PlainSearchParameters): string {
    if (!this._createURL) {
      throw new Error(
        withUsage('The `start` method needs to be called before `createURL`.')
      );
    }

    return this._createURL(
      this.mainIndex.getHelper()!.state.setQueryParameters(params)
    );
  }

  public refresh() {
    if (!this.mainHelper) {
      throw new Error(
        withUsage('The `start` method needs to be called before `refresh`.')
      );
    }

    this.mainHelper.clearCache().search();
  }
}

export default InstantSearch;
