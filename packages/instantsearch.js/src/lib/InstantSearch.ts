import EventEmitter from '@algolia/events';
import algoliasearchHelper from 'algoliasearch-helper';

import { createInsightsMiddleware } from '../middlewares/createInsightsMiddleware';
import {
  createMetadataMiddleware,
  isMetadataEnabled,
} from '../middlewares/createMetadataMiddleware';
import { createRouterMiddleware } from '../middlewares/createRouterMiddleware';
import index from '../widgets/index/index';

import createHelpers from './createHelpers';
import {
  createDocumentationMessageGenerator,
  createDocumentationLink,
  defer,
  hydrateSearchClient,
  noop,
  warning,
  setIndexHelperState,
  isIndexWidget,
} from './utils';
import version from './version';

import type {
  InsightsEvent,
  InsightsProps,
} from '../middlewares/createInsightsMiddleware';
import type { RouterProps } from '../middlewares/createRouterMiddleware';
import type {
  InsightsClient as AlgoliaInsightsClient,
  SearchClient,
  Widget,
  UiState,
  CreateURL,
  Middleware,
  MiddlewareDefinition,
  RenderState,
  InitialResults,
} from '../types';
import type { IndexWidget } from '../widgets/index/index';
import type { AlgoliaSearchHelper } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'instantsearch',
});

function defaultCreateURL() {
  return '#';
}

// this purposely breaks typescript's type inference to ensure it's not used
// as it's used for a default parameter for example
// source: https://github.com/Microsoft/TypeScript/issues/14829#issuecomment-504042546
type NoInfer<T> = T extends infer S ? S : never;

/**
 * Global options for an InstantSearch instance.
 */
export type InstantSearchOptions<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
> = {
  /**
   * The name of the main index. If no indexName is provided, you have to manually add an index widget.
   */
  indexName?: string;

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
   * @deprecated use onStateChange instead
   */
  searchFunction?: (helper: AlgoliaSearchHelper) => void;

  /**
   * Function called when the state changes.
   *
   * Using this function makes the instance controlled. This means that you
   * become in charge of updating the UI state with the `setUiState` function.
   */
  onStateChange?: (params: {
    uiState: TUiState;
    setUiState: (
      uiState: TUiState | ((previousUiState: TUiState) => TUiState)
    ) => void;
  }) => void;

  /**
   * Injects a `uiState` to the `instantsearch` instance. You can use this option
   * to provide an initial state to a widget. Note that the state is only used
   * for the first search. To unconditionally pass additional parameters to the
   * Algolia API, take a look at the `configure` widget.
   */
  initialUiState?: NoInfer<TUiState>;

  /**
   * Time before a search is considered stalled. The default is 200ms
   */
  stalledSearchDelay?: number;

  /**
   * Router configuration used to save the UI State into the URL or any other
   * client side persistence. Passing `true` will use the default URL options.
   */
  routing?: RouterProps<TUiState, TRouteState> | boolean;

  /**
   * Enables the Insights middleware and loads the Insights library
   * if not already loaded.
   *
   * The Insights middleware sends view and click events automatically, and lets
   * you set up your own events.
   *
   * @default false
   */
  insights?: InsightsProps | boolean;

  /**
   * the instance of search-insights to use for sending insights events inside
   * widgets like `hits`.
   *
   * @deprecated This property will be still supported in 4.x releases, but not further. It is replaced by the `insights` middleware. For more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/
   */
  insightsClient?: AlgoliaInsightsClient;
  future?: {
    /**
     * Changes the way `dispose` is used in InstantSearch lifecycle.
     *
     * If `false` (by default), each widget unmounting will remove its state as well, even if there are multiple widgets reading that UI State.
     *
     * If `true`, each widget unmounting will only remove its own state if it's the last of its type. This allows for dynamically adding and removing widgets without losing their state.
     *
     * @default false
     */
    // @MAJOR: Remove legacy behaviour
    preserveSharedStateOnUnmount?: boolean;
    /**
     * Changes the way root levels of hierarchical facets have their count displayed.
     *
     * If `false` (by default), the count of the refined root level is updated to match the count of the actively refined parent level.
     *
     * If `true`, the count of the root level stays the same as the count of all children levels.
     *
     * @default false
     */
    // @MAJOR: Remove legacy behaviour here and in algoliasearch-helper
    persistHierarchicalRootCount?: boolean;
  };
};

export type InstantSearchStatus = 'idle' | 'loading' | 'stalled' | 'error';

export const INSTANTSEARCH_FUTURE_DEFAULTS: Required<
  InstantSearchOptions['future']
> = {
  preserveSharedStateOnUnmount: false,
  persistHierarchicalRootCount: false,
};

/**
 * The actual implementation of the InstantSearch. This is
 * created using the `instantsearch` factory function.
 * It emits the 'render' event every time a search is done
 */
class InstantSearch<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
> extends EventEmitter {
  public client: InstantSearchOptions['searchClient'];
  public indexName: string;
  public insightsClient: AlgoliaInsightsClient | null;
  public onStateChange: InstantSearchOptions<TUiState>['onStateChange'] | null =
    null;
  public future: NonNullable<InstantSearchOptions<TUiState>['future']>;
  public helper: AlgoliaSearchHelper | null;
  public mainHelper: AlgoliaSearchHelper | null;
  public mainIndex: IndexWidget;
  public started: boolean;
  public templatesConfig: Record<string, unknown>;
  public renderState: RenderState = {};
  public _stalledSearchDelay: number;
  public _searchStalledTimer: any;
  public _initialUiState: TUiState;
  public _initialResults: InitialResults | null;
  public _createURL: CreateURL<TUiState>;
  public _searchFunction?: InstantSearchOptions['searchFunction'];
  public _mainHelperSearch?: AlgoliaSearchHelper['search'];
  public _insights: InstantSearchOptions['insights'];
  public middleware: Array<{
    creator: Middleware<TUiState>;
    instance: MiddlewareDefinition<TUiState>;
  }> = [];
  public sendEventToInsights: (event: InsightsEvent) => void;
  /**
   * The status of the search. Can be "idle", "loading", "stalled", or "error".
   */
  public status: InstantSearchStatus = 'idle';
  /**
   * The last returned error from the Search API.
   * The error gets cleared when the next valid search response is rendered.
   */
  public error: Error | undefined = undefined;

  /**
   * @deprecated use `status === 'stalled'` instead
   */
  public get _isSearchStalled(): boolean {
    warning(
      false,
      `\`InstantSearch._isSearchStalled\` is deprecated and will be removed in InstantSearch.js 5.0.

Use \`InstantSearch.status === "stalled"\` instead.`
    );

    return this.status === 'stalled';
  }

  public constructor(options: InstantSearchOptions<TUiState, TRouteState>) {
    super();

    // prevent `render` event listening from causing a warning
    this.setMaxListeners(100);

    const {
      indexName = '',
      numberLocale,
      initialUiState = {} as TUiState,
      routing = null,
      insights = undefined,
      searchFunction,
      stalledSearchDelay = 200,
      searchClient = null,
      insightsClient = null,
      onStateChange = null,
      future = {
        ...INSTANTSEARCH_FUTURE_DEFAULTS,
        ...(options.future || {}),
      },
    } = options;

    if (searchClient === null) {
      throw new Error(withUsage('The `searchClient` option is required.'));
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

    if (__DEV__ && options.future?.preserveSharedStateOnUnmount === undefined) {
      // eslint-disable-next-line no-console
      console.info(`Starting from the next major version, InstantSearch will change how widgets state is preserved when they are removed. InstantSearch will keep the state of unmounted widgets to be usable by other widgets with the same attribute.

We recommend setting \`future.preserveSharedStateOnUnmount\` to true to adopt this change today.
To stay with the current behaviour and remove this warning, set the option to false.

See documentation: ${createDocumentationLink({
        name: 'instantsearch',
      })}#widget-param-future
          `);
    }

    this.client = searchClient;
    this.future = future;
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

    this._createURL = defaultCreateURL;
    this._initialUiState = initialUiState as TUiState;
    this._initialResults = null;

    this._insights = insights;

    if (searchFunction) {
      warning(
        false,
        `The \`searchFunction\` option is deprecated. Use \`onStateChange\` instead.`
      );
      this._searchFunction = searchFunction;
    }

    this.sendEventToInsights = noop;

    if (routing) {
      const routerOptions = typeof routing === 'boolean' ? {} : routing;
      routerOptions.$$internal = true;
      this.use(createRouterMiddleware(routerOptions));
    }

    // This is the default Insights middleware,
    // added when `insights` is set to true by the user.
    // Any user-provided middleware will be added later and override this one.
    if (insights) {
      const insightsOptions = typeof insights === 'boolean' ? {} : insights;
      insightsOptions.$$internal = true;
      this.use(createInsightsMiddleware(insightsOptions));
    }

    if (isMetadataEnabled()) {
      this.use(createMetadataMiddleware({ $$internal: true }));
    }
  }

  /**
   * Hooks a middleware into the InstantSearch lifecycle.
   */
  public use(...middleware: Array<Middleware<TUiState>>): this {
    const newMiddlewareList = middleware.map((fn) => {
      const newMiddleware = {
        $$type: '__unknown__',
        $$internal: false,
        subscribe: noop,
        started: noop,
        unsubscribe: noop,
        onStateChange: noop,
        ...fn({
          instantSearchInstance: this as unknown as InstantSearch<
            UiState,
            UiState
          >,
        }),
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
      newMiddlewareList.forEach((m) => {
        m.subscribe();
        m.started();
      });
    }

    return this;
  }

  /**
   * Removes a middleware from the InstantSearch lifecycle.
   */
  public unuse(...middlewareToUnuse: Array<Middleware<TUiState>>): this {
    this.middleware
      .filter((m) => middlewareToUnuse.includes(m.creator))
      .forEach((m) => m.instance.unsubscribe());

    this.middleware = this.middleware.filter(
      (m) => !middlewareToUnuse.includes(m.creator)
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
        (widget) =>
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

    if (widgets.some((widget) => typeof widget.dispose !== 'function')) {
      throw new Error(
        withUsage('The widget definition expects a `dispose` method.')
      );
    }

    this.mainIndex.removeWidgets(widgets);

    return this;
  }

  /**
   * Ends the initialization of InstantSearch.js and triggers the
   * first search.
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
    // In Vue InstantSearch' hydrate, a main helper gets set before start, so
    // we need to respect this helper as a way to keep all listeners correct.
    const mainHelper =
      this.mainHelper ||
      algoliasearchHelper(this.client, this.indexName, undefined, {
        persistHierarchicalRootCount: this.future.persistHierarchicalRootCount,
      });

    mainHelper.search = () => {
      this.status = 'loading';
      this.scheduleRender(false);

      warning(
        Boolean(this.indexName) ||
          this.mainIndex.getWidgets().some(isIndexWidget),
        'No indexName provided, nor an explicit index widget in the widgets tree. This is required to be able to display results.'
      );

      // This solution allows us to keep the exact same API for the users but
      // under the hood, we have a different implementation. It should be
      // completely transparent for the rest of the codebase. Only this module
      // is impacted.
      return mainHelper.searchOnlyWithDerivedHelpers();
    };

    if (this._searchFunction) {
      // this client isn't used to actually search, but required for the helper
      // to not throw errors
      const fakeClient = {
        search: () => new Promise(noop),
      } as any as SearchClient;

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
      if (!(error instanceof Error)) {
        // typescript lies here, error is in some cases { name: string, message: string }
        const err = error as Record<string, any>;
        error = Object.keys(err).reduce((acc, key) => {
          (acc as any)[key] = err[key];
          return acc;
        }, new Error(err.message));
      }
      // If an error is emitted, it is re-thrown by events. In previous versions
      // we emitted {error}, which is thrown as:
      // "Uncaught, unspecified \"error\" event. ([object Object])"
      // To avoid breaking changes, we make the error available in both
      // `error` and `error.error`
      // @MAJOR emit only error
      (error as any).error = error;
      this.error = error;
      this.status = 'error';
      this.scheduleRender(false);

      // This needs to execute last because it throws the error.
      this.emit('error', error);
    });

    this.mainHelper = mainHelper;

    this.middleware.forEach(({ instance }) => {
      instance.subscribe();
    });

    this.mainIndex.init({
      instantSearchInstance: this as unknown as InstantSearch<UiState, UiState>,
      parent: null,
      uiState: this._initialUiState,
    });

    if (this._initialResults) {
      hydrateSearchClient(this.client, this._initialResults);

      const originalScheduleSearch = this.scheduleSearch;
      // We don't schedule a first search when initial results are provided
      // because we already have the results to render. This skips the initial
      // network request on the browser on `start`.
      this.scheduleSearch = defer(noop);
      // We also skip the initial network request when widgets are dynamically
      // added in the first tick (that's the case in all the framework-based flavors).
      // When we add a widget to `index`, it calls `scheduleSearch`. We can rely
      // on our `defer` util to restore the original `scheduleSearch` value once
      // widgets are added to hook back to the regular lifecycle.
      defer(() => {
        this.scheduleSearch = originalScheduleSearch;
      })();
    }
    // We only schedule a search when widgets have been added before `start()`
    // because there are listeners that can use these results.
    // This is especially useful in framework-based flavors that wait for
    // dynamically-added widgets to trigger a network request. It avoids
    // having to batch this initial network request with the one coming from
    // `addWidgets()`.
    // Later, we could also skip `index()` widgets and widgets that don't read
    // the results, but this is an optimization that has a very low impact for now.
    else if (this.mainIndex.getWidgets().length > 0) {
      this.scheduleSearch();
    }

    // Keep the previous reference for legacy purpose, some pattern use
    // the direct Helper access `search.helper` (e.g multi-index).
    this.helper = this.mainIndex.getHelper();

    // track we started the search if we add more widgets,
    // to init them directly after add
    this.started = true;

    this.middleware.forEach(({ instance }) => {
      instance.started();
    });

    // This is the automatic Insights middleware,
    // added when `insights` is unset and the initial results possess `queryID`.
    // Any user-provided middleware will be added later and override this one.
    if (typeof this._insights === 'undefined') {
      mainHelper.derivedHelpers[0].once('result', () => {
        const hasAutomaticInsights = this.mainIndex
          .getScopedResults()
          .some(({ results }) => results?._automaticInsights);
        if (hasAutomaticInsights) {
          this.use(
            createInsightsMiddleware({
              $$internal: true,
              $$automatic: true,
            })
          );
        }
      });
    }
  }

  /**
   * Removes all widgets without triggering a search afterwards.
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
    this.mainHelper?.removeAllListeners();
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

  public scheduleRender = defer((shouldResetStatus: boolean = true) => {
    if (!this.mainHelper?.hasPendingRequests()) {
      clearTimeout(this._searchStalledTimer);
      this._searchStalledTimer = null;

      if (shouldResetStatus) {
        this.status = 'idle';
        this.error = undefined;
      }
    }

    this.mainIndex.render({
      instantSearchInstance: this as unknown as InstantSearch<UiState, UiState>,
    });

    this.emit('render');
  });

  public scheduleStalledRender() {
    if (!this._searchStalledTimer) {
      this._searchStalledTimer = setTimeout(() => {
        this.status = 'stalled';
        this.scheduleRender();
      }, this._stalledSearchDelay);
    }
  }

  /**
   * Set the UI state and trigger a search.
   * @param uiState The next UI state or a function computing it from the current state
   * @param callOnStateChange private parameter used to know if the method is called from a state change
   */
  public setUiState(
    uiState: TUiState | ((previousUiState: TUiState) => TUiState),
    callOnStateChange: boolean = true
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
        ? uiState(this.mainIndex.getWidgetUiState({}) as TUiState)
        : uiState;

    if (this.onStateChange && callOnStateChange) {
      this.onStateChange({
        uiState: nextUiState,
        setUiState: (finalUiState) => {
          setIndexHelperState(
            typeof finalUiState === 'function'
              ? finalUiState(nextUiState)
              : finalUiState,
            this.mainIndex
          );

          this.scheduleSearch();
          this.onInternalStateChange();
        },
      });
    } else {
      setIndexHelperState(nextUiState, this.mainIndex);

      this.scheduleSearch();
      this.onInternalStateChange();
    }
  }

  public getUiState(): TUiState {
    if (this.started) {
      // We refresh the index UI state to make sure changes from `refine` are taken in account
      this.mainIndex.refreshUiState();
    }

    return this.mainIndex.getWidgetUiState({}) as TUiState;
  }

  public onInternalStateChange = defer(() => {
    const nextUiState = this.mainIndex.getWidgetUiState({}) as TUiState;

    this.middleware.forEach(({ instance }) => {
      instance.onStateChange({
        uiState: nextUiState,
      });
    });
  });

  public createURL(nextState: TUiState = {} as TUiState): string {
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
