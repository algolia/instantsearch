import EventEmitter from '@algolia/events';
import algoliasearchHelper from 'algoliasearch-helper';

import {
  createDocumentationMessageGenerator,
  createDocumentationLink,
  defer,
  isIndexWidget,
  noop,
  warning,
} from './lib/public';
import {
  hydrateRecommendCache,
  hydrateSearchClient,
  setIndexHelperState,
} from './lib/utils';
import { createInsightsMiddleware } from './middlewares/createInsightsMiddleware';
import {
  createMetadataMiddleware,
  isMetadataEnabled,
} from './middlewares/createMetadataMiddleware';
import { createRouterMiddleware } from './middlewares/createRouterMiddleware';
import version from './version';
import { index } from './widgets/index-widget';

import type {
  Widget,
  IndexWidget,
  UiState,
  CreateURL,
  Middleware,
  MiddlewareDefinition,
  RenderState,
  InitialResults,
  Expand,
  InstantSearchOptions,
  InstantSearchStatus,
  InsightsEvent,
} from './types';
import type { AlgoliaSearchHelper } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'instantsearch',
});

function defaultCreateURL() {
  return '#';
}

export const INSTANTSEARCH_FUTURE_DEFAULTS: Required<
  InstantSearchOptions['future']
> = {};

/**
 * The actual implementation of the InstantSearch. This is
 * created using the `instantsearch` factory function.
 * It emits the 'render' event every time a search is done
 */
export class InstantSearch<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
> extends EventEmitter {
  client: InstantSearchOptions['searchClient'];
  indexName: string;
  compositionID?: string;
  onStateChange: InstantSearchOptions<TUiState>['onStateChange'] | null = null;
  future: NonNullable<InstantSearchOptions<TUiState>['future']>;
  helper: AlgoliaSearchHelper | null;
  mainIndex: IndexWidget;
  started: boolean;
  renderState: RenderState = {};
  _stalledSearchDelay: number;
  _searchStalledTimer: any;
  _initialUiState: TUiState;
  _initialResults: InitialResults | null;
  _createURL: CreateURL<TUiState>;
  _helperSearch?: AlgoliaSearchHelper['search'];
  _hasSearchWidget: boolean = false;
  _hasRecommendWidget: boolean = false;
  _insights: InstantSearchOptions['insights'];
  middleware: Array<{
    creator: Middleware<TUiState>;
    instance: MiddlewareDefinition<TUiState>;
  }> = [];
  sendEventToInsights: (event: InsightsEvent) => void;
  /**
   * The status of the search. Can be "idle", "loading", "stalled", or "error".
   */
  status: InstantSearchStatus = 'idle';
  /**
   * The last returned error from the Search API.
   * The error gets cleared when the next valid search response is rendered.
   */
  error: Error | undefined = undefined;

  constructor(options: InstantSearchOptions<TUiState, TRouteState>) {
    super();

    // prevent `render` event listening from causing a warning
    this.setMaxListeners(100);

    const {
      indexName = '',
      compositionID,
      initialUiState = {} as TUiState,
      routing = null,
      insights = undefined,
      stalledSearchDelay = 200,
      searchClient = null,
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
      searchClient.addAlgoliaAgent(`instantsearch-core (${version})`);
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
    this.future = future;
    this.indexName = indexName;
    this.compositionID = compositionID;
    this.helper = null;
    this.mainIndex = index({
      // we use an index widget to render compositions
      // this only works because there's only one composition index allow for now
      indexName: this.compositionID || this.indexName,
    });
    this.onStateChange = onStateChange;

    this.started = false;

    this._stalledSearchDelay = stalledSearchDelay;
    this._searchStalledTimer = null;

    this._createURL = defaultCreateURL;
    this._initialUiState = initialUiState;
    this._initialResults = null;

    this._insights = insights;

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

  use(...middleware: Array<Middleware<TUiState>>) {
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

  unuse(...middlewareToUnuse: Array<Middleware<TUiState>>) {
    this.middleware
      .filter((m) => middlewareToUnuse.includes(m.creator))
      .forEach((m) => m.instance.unsubscribe());

    this.middleware = this.middleware.filter(
      (m) => !middlewareToUnuse.includes(m.creator)
    );

    return this;
  }

  addWidgets(widgets: Array<Widget | IndexWidget>) {
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

    if (this.compositionID && widgets.some(isIndexWidget)) {
      throw new Error(
        withUsage(
          'The `index` widget cannot be used with a composition-based InstantSearch implementation.'
        )
      );
    }

    this.mainIndex.addWidgets(widgets);

    return this;
  }

  removeWidgets(widgets: Array<Widget | IndexWidget>) {
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

  start() {
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
    const helper =
      this.helper ||
      algoliasearchHelper(this.client, this.indexName, undefined);

    if (this.compositionID) {
      helper.searchForFacetValues =
        helper.searchForCompositionFacetValues.bind(helper);
    }

    helper.search = () => {
      this.status = 'loading';
      this.scheduleRender(false);

      warning(
        Boolean(this.indexName) ||
          Boolean(this.compositionID) ||
          this.mainIndex.getWidgets().some(isIndexWidget),
        'No indexName provided, nor an explicit index widget in the widgets tree. This is required to be able to display results.'
      );

      // This solution allows us to keep the exact same API for the users but
      // under the hood, we have a different implementation. It should be
      // completely transparent for the rest of the codebase. Only this module
      // is impacted.
      if (this._hasSearchWidget) {
        if (this.compositionID) {
          helper.searchWithComposition();
        } else {
          helper.searchOnlyWithDerivedHelpers();
        }
      }

      if (this._hasRecommendWidget) {
        helper.recommend();
      }

      return helper;
    };

    // Only the "main" Helper emits the `error` event vs the one for `search`
    // and `results` that are also emitted on the derived one.
    helper.on('error', (error) => {
      if (!(error instanceof Error)) {
        // typescript lies here, error is in some cases { name: string, message: string }
        const err = error as Record<string, any>;
        this.error = Object.keys(err).reduce((acc, key) => {
          (acc as any)[key] = err[key];
          return acc;
        }, new Error(err.message));
      } else {
        this.error = error;
      }
      this.status = 'error';
      this.scheduleRender(false);

      // This needs to execute last because it throws the error.
      this.emit('error', this.error);
    });

    this.helper = helper;

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
      hydrateRecommendCache(this.helper, this._initialResults);

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
      helper.derivedHelpers[0].once('result', () => {
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

  dispose() {
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
    this.helper?.removeAllListeners();
    this.helper = null;

    this.middleware.forEach(({ instance }) => {
      instance.unsubscribe();
    });
  }

  scheduleSearch = defer(() => {
    if (this.started) {
      this.helper!.search();
    }
  });

  scheduleRender = defer((shouldResetStatus: boolean = true) => {
    if (!this.helper?.hasPendingRequests()) {
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

  scheduleStalledRender() {
    if (!this._searchStalledTimer) {
      this._searchStalledTimer = setTimeout(() => {
        this.status = 'stalled';
        this.scheduleRender();
      }, this._stalledSearchDelay);
    }
  }

  setUiState(
    uiState: TUiState | ((previousUiState: TUiState) => TUiState),
    callOnStateChange = true
  ) {
    if (!this.helper) {
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

  getUiState() {
    if (this.started) {
      // We refresh the index UI state to make sure changes from `refine` are taken in account
      this.mainIndex.refreshUiState();
    }

    return this.mainIndex.getWidgetUiState({}) as TUiState;
  }

  onInternalStateChange = defer(() => {
    const nextUiState = this.mainIndex.getWidgetUiState({}) as TUiState;

    this.middleware.forEach(({ instance }) => {
      instance.onStateChange({
        uiState: nextUiState,
      });
    });
  });

  createURL(nextState: TUiState = {} as TUiState) {
    if (!this.started) {
      throw new Error(
        withUsage('The `start` method needs to be called before `createURL`.')
      );
    }

    return this._createURL(nextState);
  }

  refresh() {
    if (!this.helper) {
      throw new Error(
        withUsage('The `start` method needs to be called before `refresh`.')
      );
    }

    this.helper.clearCache().search();
  }
}

type InstantSearchModule = {
  <TUiState = Record<string, unknown>, TRouteState = TUiState>(
    options: InstantSearchOptions<Expand<UiState & TUiState>, TRouteState>
  ): InstantSearch<Expand<UiState & TUiState>, TRouteState>;
  version: string;
};

/**
 * InstantSearch is the main component of InstantSearch.js. This object
 * manages the widget and lets you add new ones.
 *
 * Two parameters are required to get you started with InstantSearch.js:
 *  - `indexName`: the main index that you will use for your new search UI
 *  - `searchClient`: the search client to plug to InstantSearch.js
 *
 * The [search client provided by Algolia](algolia.com/doc/api-client/getting-started/what-is-the-api-client/javascript/)
 * needs an `appId` and an `apiKey`. Those parameters can be found in your
 * [Algolia dashboard](https://www.algolia.com/api-keys).
 *
 * If you want to get up and running quickly with InstantSearch.js, have a
 * look at the [getting started](https://www.algolia.com/doc/guides/building-search-ui/getting-started/js/).
 */
export const instantsearch: InstantSearchModule = (options) =>
  new InstantSearch(options);
instantsearch.version = version;
