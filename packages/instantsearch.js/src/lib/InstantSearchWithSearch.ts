import algoliasearchHelper from 'algoliasearch-helper';

import index from '../widgets/index/index';

import { InstantSearchBase } from './InstantSearchBase';
import {
  createDocumentationMessageGenerator,
  defer,
  hydrateRecommendCache,
  hydrateSearchClient,
  noop,
  setIndexHelperState,
  isIndexWidget,
  warning,
} from './utils';

import type {
  SearchClient,
  UiState,
  CreateURL,
  InitialResults,
  CompositionClient,
} from '../types';
import type {
  InstantSearchOptions,
  InstantSearchStatus,
} from './InstantSearch';
import type { AlgoliaSearchHelper } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'instantsearch',
});

function defaultCreateURL() {
  return '#';
}

export const INSTANTSEARCH_FUTURE_DEFAULTS: Required<
  NonNullable<InstantSearchOptions['future']>
> = {
  preserveSharedStateOnUnmount: false,
  persistHierarchicalRootCount: false,
};

export type InstantSearchWithSearchOptions<TUiState extends UiState = UiState> =
  Pick<
    InstantSearchOptions<TUiState>,
    | 'indexName'
    | 'compositionID'
    | 'searchClient'
    | 'initialUiState'
    | 'onStateChange'
    | 'future'
    | 'stalledSearchDelay'
    | 'searchFunction'
  >;

/**
 * `InstantSearchBase` plus searching: the search helper, the index tree,
 * scheduled searches, the status of the search, and the UI state.
 *
 * Routing, Insights, the deprecated options and the validation of the options
 * are not part of it: `InstantSearch` adds those. Everything that is imported
 * here is what you pay for when you want searching but not those.
 */
export class InstantSearchWithSearch<
  TUiState extends UiState = UiState,
> extends InstantSearchBase<TUiState, SearchClient | CompositionClient> {
  public compositionID?: string;
  public onStateChange: InstantSearchOptions<TUiState>['onStateChange'] | null =
    null;
  public future: NonNullable<InstantSearchOptions<TUiState>['future']>;
  public helper: AlgoliaSearchHelper | null;
  public _stalledSearchDelay: number;
  public _searchStalledTimer: any;
  public _initialResults: InitialResults | null;
  public _manuallyResetScheduleSearch: boolean = false;
  public _resetScheduleSearch?: () => void;
  public _createURL: CreateURL<TUiState>;
  public _searchFunction?: InstantSearchOptions['searchFunction'];
  public _mainHelperSearch?: AlgoliaSearchHelper['search'];
  public _hasSearchWidget: boolean = false;
  public _hasRecommendWidget: boolean = false;
  /**
   * The status of the search. Can be "idle", "loading", "stalled", or "error".
   */
  public status: InstantSearchStatus = 'idle';
  /**
   * The last returned error from the Search API.
   * The error gets cleared when the next valid search response is rendered.
   */
  public error: Error | undefined = undefined;

  public constructor({
    indexName = '',
    compositionID,
    searchClient,
    initialUiState,
    onStateChange,
    future = INSTANTSEARCH_FUTURE_DEFAULTS,
    stalledSearchDelay = 200,
    searchFunction,
  }: InstantSearchWithSearchOptions<TUiState>) {
    super({
      client: searchClient,
      indexName,
      mainIndex: index({
        // we use an index widget to render compositions
        // this only works because there's only one composition index allow for now
        indexName: compositionID || indexName,
      }),
    });

    this.future = future;
    this.compositionID = compositionID;
    this.helper = null;
    this.onStateChange = onStateChange ?? null;

    this._stalledSearchDelay = stalledSearchDelay;
    this._searchStalledTimer = null;

    this._createURL = defaultCreateURL;
    this._initialUiState = (initialUiState ?? {}) as TUiState;
    this._initialResults = null;
    this._searchFunction = searchFunction;
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

    super.start();
  }

  public _beforeStart() {
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

    if (this.compositionID) {
      mainHelper.searchForFacetValues =
        mainHelper.searchForCompositionFacetValues.bind(mainHelper);
    }

    mainHelper.search = () => {
      const hasSearchOrRecommendWidget =
        this._hasSearchWidget || this._hasRecommendWidget;

      if (hasSearchOrRecommendWidget) {
        this.status = 'loading';
      }
      this.scheduleRender(!hasSearchOrRecommendWidget);

      warning(
        !hasSearchOrRecommendWidget ||
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
          mainHelper.searchWithComposition();
        } else {
          mainHelper.searchOnlyWithDerivedHelpers();
        }
      }

      if (this._hasRecommendWidget) {
        mainHelper.recommend();
      }

      return mainHelper;
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
      this.scheduleRender(!this._hasSearchWidget && !this._hasRecommendWidget);

      // This needs to execute last because it throws the error.
      this.emit('error', error);
    });

    this.mainHelper = mainHelper;
  }

  public _afterInit() {
    if (this._initialResults) {
      hydrateSearchClient(this.client, this._initialResults);
      hydrateRecommendCache(this.mainHelper!, this._initialResults);

      const originalScheduleSearch = this.scheduleSearch;
      // We don't schedule a first search when initial results are provided
      // because we already have the results to render. This skips the initial
      // network request on the browser on `start`.
      this.scheduleSearch = defer(noop);
      if (this._manuallyResetScheduleSearch) {
        // If `_manuallyResetScheduleSearch` is passed, it means that we don't
        // want to rely on a single `defer` to reset the `scheduleSearch`.
        // Instead, the consumer will call `_resetScheduleSearch` to restore
        // the original `scheduleSearch` function.
        // This happens in the React flavour after rendering.
        this._resetScheduleSearch = () => {
          this.scheduleSearch = originalScheduleSearch;
        };
      } else {
        // We also skip the initial network request when widgets are dynamically
        // added in the first tick (that's the case in all the framework-based flavors).
        // When we add a widget to `index`, it calls `scheduleSearch`. We can rely
        // on our `defer` util to restore the original `scheduleSearch` value once
        // widgets are added to hook back to the regular lifecycle.
        defer(() => {
          this.scheduleSearch = originalScheduleSearch;
        })();
      }
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
  }

  /**
   * Removes all widgets without triggering a search afterwards.
   * @return {undefined} This method does not return anything
   */
  public dispose(): void {
    this.scheduleSearch.cancel();
    clearTimeout(this._searchStalledTimer);

    super.dispose();
  }

  public _disposeSearch() {
    // The helper needs to be reset to perform the next search from a fresh state.
    // If not reset, it would use the state stored before calling `dispose()`.
    this.mainHelper?.removeAllListeners();
    this.mainHelper = null;
    this.helper = null;
  }

  public scheduleSearch = defer(() => {
    if (this.started) {
      this.mainHelper!.search();
    }
  });

  public _beforeRender(shouldResetStatus: boolean) {
    if (!this.mainHelper?.hasPendingRequests()) {
      clearTimeout(this._searchStalledTimer);
      this._searchStalledTimer = null;

      if (shouldResetStatus) {
        this.status = 'idle';
        this.error = undefined;
      }
    }
  }

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
   * @param onApply private parameter called with the UI state notified to the middleware when this notification applies this UI state and no other change. With a controlled `onStateChange`, it can be later or never.
   */
  public setUiState(
    uiState: TUiState | ((previousUiState: TUiState) => TUiState),
    callOnStateChange: boolean = true,
    onApply?: (notifiedUiState: TUiState) => void
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
          this._applyUiState(
            typeof finalUiState === 'function'
              ? finalUiState(nextUiState)
              : finalUiState,
            onApply
          );
        },
      });
    } else {
      this._applyUiState(nextUiState, onApply);
    }
  }

  /**
   * Set while `_applyUiState` sets the helper state. The index widgets notify
   * their state change with its `onApply`, as part of applying that UI state.
   */
  public _applyingUiState?: {
    onApply?: (notifiedUiState: TUiState) => void;
  };

  public _applyUiState(
    uiState: TUiState,
    onApply?: (notifiedUiState: TUiState) => void
  ) {
    this._applyingUiState = { onApply };
    try {
      setIndexHelperState(uiState, this.mainIndex);
    } finally {
      this._applyingUiState = undefined;
    }

    this.scheduleSearch();
    this.onInternalStateChange(onApply);
  }

  public getUiState(): TUiState {
    if (this.started) {
      // We refresh the index UI state to make sure changes from `refine` are taken in account
      this.mainIndex.refreshUiState();
    }

    return this.mainIndex.getWidgetUiState({}) as TUiState;
  }

  public onInternalStateChange = defer(
    (onApply?: (notifiedUiState: TUiState) => void) => {
      const nextUiState = this.mainIndex.getWidgetUiState({}) as TUiState;

      onApply?.(nextUiState);

      this.middleware.forEach(({ instance }) => {
        instance.onStateChange({
          uiState: nextUiState,
        });
      });
    },
    // The notified state applies a UI state given to `setUiState` when it's the
    // last change: applying it overwrites earlier changes, but a later change
    // is part of the notified state. The changes made while applying it pass
    // the same `onApply`.
    (_pending, next) => next
  );

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
