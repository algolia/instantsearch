import algoliasearchHelper, { AlgoliaSearchHelper } from 'algoliasearch-helper';
import EventEmitter from 'events';
import index, { IndexWidget, isIndexWidget } from '../widgets/index/index';
import version from './version';
import createHelpers from './createHelpers';
import {
  createDocumentationMessageGenerator,
  createDocumentationLink,
  defer,
  noop,
  warning,
  checkIndexUiState,
} from './utils';
import {
  InsightsClient as AlgoliaInsightsClient,
  SearchClient,
  Widget,
  UiState,
  CreateURL,
  Middleware,
  MiddlewareDefinition,
  RenderState,
} from '../types';
import {
  createRouterMiddleware,
  RouterProps,
} from '../middlewares/createRouterMiddleware';
import { InsightsEvent } from '../middlewares/createInsightsMiddleware';
import {
  createMetadataMiddleware,
  isMetadataEnabled,
} from '../middlewares/createMetadataMiddleware';

const withUsage = createDocumentationMessageGenerator({
  name: 'instantsearch',
});

function defaultCreateURL() {
  return '#';
}

/**
 * Global options for an InstantSearch instance.
 */
export type InstantSearchOptions = {
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
  searchClient: SearchClient;

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
   * Function called when the state changes.
   *
   * Using this function makes the instance controlled. This means that you
   * become in charge of updating the UI state with the `setUiState` function.
   */
  onStateChange?: (params: {
    uiState: UiState;
    setUiState(
      uiState: UiState | ((previousUiState: UiState) => UiState)
    ): void;
  }) => void;

  /**
   * Injects a `uiState` to the `instantsearch` instance. You can use this option
   * to provide an initial state to a widget. Note that the state is only used
   * for the first search. To unconditionally pass additional parameters to the
   * Algolia API, take a look at the `configure` widget.
   */
  initialUiState?: UiState;

  /**
   * Time before a search is considered stalled. The default is 200ms
   */
  stalledSearchDelay?: number;

  /**
   * Router configuration used to save the UI State into the URL or any other
   * client side persistence. Passing `true` will use the default URL options.
   */
  routing?: RouterProps | boolean;

  /**
   * the instance of search-insights to use for sending insights events inside
   * widgets like `hits`.
   *
   * @deprecated This property will be still supported in 4.x releases, but not further. It is replaced by the `insights` middleware. For more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/
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
  public onStateChange: InstantSearchOptions['onStateChange'] | null = null;
  public helper: AlgoliaSearchHelper | null;
  public mainHelper: AlgoliaSearchHelper | null;
  public mainIndex: IndexWidget;
  public started: boolean;
  public templatesConfig: Record<string, unknown>;
  public renderState: RenderState = {};
  public _stalledSearchDelay: number;
  public _searchStalledTimer: any;
  public _isSearchStalled: boolean;
  public _initialUiState: UiState;
  public _createURL: CreateURL<UiState>;
  public _searchFunction?: InstantSearchOptions['searchFunction'];
  public _mainHelperSearch?: AlgoliaSearchHelper['search'];
  public middleware: Array<{
    creator: Middleware;
    instance: MiddlewareDefinition;
  }> = [];
  public sendEventToInsights: (event: InsightsEvent) => void;

  public constructor(options: InstantSearchOptions) {
    super();

    const {
      indexName = null,
      numberLocale,
      initialUiState = {},
      routing = null,
      searchFunction,
      stalledSearchDelay = 200,
      searchClient = null,
      insightsClient = null,
      onStateChange = null,
    } = options;

    if (indexName === null) {
      throw new Error(withUsage('The `indexName` option is required.'));
    }

    if (searchClient === null) {
      throw new Error(withUsage('The `searchClient` option is required.'));
    }

    if (typeof (searchClient as any).search !== 'function') {
      throw new Error(
        `The \`searchClient\` must implement a \`search\` method.

See: https://www.algolia.com/doc/guides/building-search-ui/going-further/backend-search/in-depth/backend-instantsearch/js/`
      );
    }

    if (typeof searchClient.addAlgoliaAgent === 'function') {
      searchClient.addAlgoliaAgent(`instantsearch.js (${version})`);
    }

    warning(
      insightsClient === null,
      `\`insightsClient\` property has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the \`insights\` middleware.

For more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/`
    );

    if (insightsClient && typeof insightsClient !== 'function') {
      throw new Error(
        withUsage('The `insightsClient` option should be a function.')
      );
    }

    warning(
      !(options as any).searchParameters,
      `The \`searchParameters\` option is deprecated and will not be supported in InstantSearch.js 4.x.

You can replace it with the \`configure\` widget:

\`\`\`
search.addWidgets([
  configure(${JSON.stringify((options as any).searchParameters, null, 2)})
]);
\`\`\`

See ${createDocumentationLink({
        name: 'configure',
      })}`
    );

    this.client = searchClient;
    this.insightsClient = insightsClient;
    this.indexName = indexName;
    this.helper = null;
    this.mainHelper = null;
    this.mainIndex = index({
      indexName,
    });
    this.onStateChange = onStateChange;

    this.started = false;
    this.templatesConfig = {
      helpers: createHelpers({ numberLocale }),
      compileOptions: {},
    };

    this._stalledSearchDelay = stalledSearchDelay;
    this._searchStalledTimer = null;
    this._isSearchStalled = false;

    this._createURL = defaultCreateURL;
    this._initialUiState = initialUiState;

    if (searchFunction) {
      this._searchFunction = searchFunction;
    }

    this.sendEventToInsights = noop;

    if (routing) {
      const routerOptions = typeof routing === 'boolean' ? undefined : routing;
      this.use(createRouterMiddleware(routerOptions));
    }

    if (isMetadataEnabled()) {
      this.use(createMetadataMiddleware());
    }
  }

  /**
   * Hooks a middleware into the InstantSearch lifecycle.
   */
  public use(...middleware: Middleware[]): this {
    const newMiddlewareList = middleware.map(fn => {
      const newMiddleware = {
        subscribe: noop,
        unsubscribe: noop,
        onStateChange: noop,
        ...fn({ instantSearchInstance: this }),
      };
      this.middleware.push({
        creator: fn,
        instance: newMiddleware,
      });
      return newMiddleware;
    });

    // If the instance has already started, we directly subscribe the
    // middleware so they're notified of changes.
    if (this.started) {
      newMiddlewareList.forEach(m => {
        m.subscribe();
      });
    }

    return this;
  }

  /**
   * Removes a middleware from the InstantSearch lifecycle.
   */
  public unuse(...middlewareToUnuse: Middleware[]): this {
    this.middleware
      .filter(m => middlewareToUnuse.includes(m.creator))
      .forEach(m => m.instance.unsubscribe());

    this.middleware = this.middleware.filter(
      m => !middlewareToUnuse.includes(m.creator)
    );

    return this;
  }

  // @major we shipped with EXPERIMENTAL_use, but have changed that to just `use` now
  public EXPERIMENTAL_use(...middleware: Middleware[]): this {
    warning(
      false,
      'The middleware API is now considered stable, so we recommend replacing `EXPERIMENTAL_use` with `use` before upgrading to the next major version.'
    );

    return this.use(...middleware);
  }

  /**
   * Adds a widget to the search instance.
   * A widget can be added either before or after InstantSearch has started.
   * @param widget The widget to add to InstantSearch.
   *
   * @deprecated This method will still be supported in 4.x releases, but not further. It is replaced by `addWidgets([widget])`.
   */
  public addWidget(widget: Widget) {
    warning(
      false,
      'addWidget will still be supported in 4.x releases, but not further. It is replaced by `addWidgets([widget])`'
    );

    return this.addWidgets([widget]);
  }

  /**
   * Adds multiple widgets to the search instance.
   * Widgets can be added either before or after InstantSearch has started.
   * @param widgets The array of widgets to add to InstantSearch.
   */
  public addWidgets(widgets: Array<Widget | IndexWidget>) {
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

    return this;
  }

  /**
   * Removes a widget from the search instance.
   * @deprecated This method will still be supported in 4.x releases, but not further. It is replaced by `removeWidgets([widget])`
   * @param widget The widget instance to remove from InstantSearch.
   *
   * The widget must implement a `dispose()` method to clear its state.
   */
  public removeWidget(widget: Widget | IndexWidget) {
    warning(
      false,
      'removeWidget will still be supported in 4.x releases, but not further. It is replaced by `removeWidgets([widget])`'
    );

    return this.removeWidgets([widget]);
  }

  /**
   * Removes multiple widgets from the search instance.
   * @param widgets Array of widgets instances to remove from InstantSearch.
   *
   * The widgets must implement a `dispose()` method to clear their states.
   */
  public removeWidgets(widgets: Array<Widget | IndexWidget>) {
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

    return this;
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
      } as any) as SearchClient;

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
        // Forward state changes from `searchFunctionHelper` to `mainIndexHelper`
        searchFunctionHelper.on('change', ({ state }) => {
          mainIndexHelper!.setState(state);
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
      uiState: this._initialUiState,
    });

    this.middleware.forEach(({ instance }) => {
      instance.subscribe();
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

    this.middleware.forEach(({ instance }) => {
      instance.unsubscribe();
    });
  }

  public scheduleSearch = defer(() => {
    if (this.started) {
      this.mainHelper!.search();
    }
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

  public setUiState(
    uiState: UiState | ((previousUiState: UiState) => UiState)
  ): void {
    if (!this.mainHelper) {
      throw new Error(
        withUsage('The `start` method needs to be called before `setUiState`.')
      );
    }

    // We refresh the index UI state to update the local UI state that the
    // main index passes to the function form of `setUiState`.
    this.mainIndex.refreshUiState();
    const nextUiState =
      typeof uiState === 'function'
        ? uiState(this.mainIndex.getWidgetUiState({}))
        : uiState;

    const setIndexHelperState = (indexWidget: IndexWidget) => {
      if (__DEV__) {
        checkIndexUiState({
          index: indexWidget,
          indexUiState: nextUiState[indexWidget.getIndexId()],
        });
      }

      indexWidget.getHelper()!.setState(
        indexWidget.getWidgetSearchParameters(indexWidget.getHelper()!.state, {
          uiState: nextUiState[indexWidget.getIndexId()],
        })
      );

      indexWidget
        .getWidgets()
        .filter(isIndexWidget)
        .forEach(setIndexHelperState);
    };

    setIndexHelperState(this.mainIndex);

    this.scheduleSearch();
  }

  public getUiState(): UiState {
    if (this.started) {
      // We refresh the index UI state to make sure changes from `refine` are taken in account
      this.mainIndex.refreshUiState();
    }

    return this.mainIndex.getWidgetUiState({});
  }

  public onInternalStateChange = defer(() => {
    const nextUiState = this.mainIndex.getWidgetUiState({});

    this.middleware.forEach(({ instance }) => {
      instance.onStateChange({
        uiState: nextUiState,
      });
    });
  });

  public createURL(nextState: UiState = {}): string {
    if (!this.started) {
      throw new Error(
        withUsage('The `start` method needs to be called before `createURL`.')
      );
    }

    return this._createURL(nextState);
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
