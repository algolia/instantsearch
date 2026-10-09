import { createInsightsMiddleware } from '../middlewares/createInsightsMiddleware';
import {
  createMetadataMiddleware,
  isMetadataEnabled,
} from '../middlewares/createMetadataMiddleware';
import { createRouterMiddleware } from '../middlewares/createRouterMiddleware';

import createHelpers from './createHelpers';
import {
  INSTANTSEARCH_FUTURE_DEFAULTS,
  InstantSearchWithSearch,
} from './InstantSearchWithSearch';
import {
  createDocumentationMessageGenerator,
  createDocumentationLink,
  warning,
  isIndexWidget,
} from './utils';
import version from './version';

import type { InsightsProps } from '../middlewares/createInsightsMiddleware';
import type { RouterProps } from '../middlewares/createRouterMiddleware';
import type {
  InsightsClient as AlgoliaInsightsClient,
  SearchClient,
  Widget,
  IndexWidget,
  UiState,
  Middleware,
  CompositionClient,
} from '../types';
import type { AlgoliaSearchHelper } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'instantsearch',
});

// this purposely breaks typescript's type inference to ensure it's not used
// as it's used for a default parameter for example
// source: https://github.com/Microsoft/TypeScript/issues/14829#issuecomment-504042546
type NoInfer<T> = T extends infer S ? S : never;

/**
 * Global options for an InstantSearch instance.
 */
export type InstantSearchOptions<
  TUiState extends UiState = UiState,
  TRouteState = TUiState,
> = {
  /**
   * The name of the main index. If no indexName is provided, you have to manually add an index widget.
   */
  indexName?: string;

  /**
   * The objectID of the composition.
   * If this is passed, the composition API will be used for search.
   * Multi-index search is not supported with this option.
   */
  compositionID?: string;

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
  searchClient: SearchClient | CompositionClient;

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

export { INSTANTSEARCH_FUTURE_DEFAULTS };

/**
 * The actual implementation of the InstantSearch. This is
 * created using the `instantsearch` factory function.
 * It emits the 'render' event every time a search is done
 */
class InstantSearch<
  TUiState extends UiState = UiState,
  TRouteState = TUiState,
> extends InstantSearchWithSearch<TUiState> {
  public insightsClient: AlgoliaInsightsClient | null;
  public _insights: InstantSearchOptions['insights'];
  /**
   * The options the instance was created with, kept verbatim so consumers
   * (e.g. usage events) can introspect the configuration without the class
   * having to enumerate every option by hand. Typed without the class generics
   * on purpose: referencing `TUiState`/`TRouteState` here (they sit in
   * contravariant positions inside `InstantSearchOptions`) would break the
   * assignability of `InstantSearch<SpecificUiState>` to `InstantSearch`.
   */
  public _initialOptions: InstantSearchOptions | null;

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
    const {
      indexName = '',
      compositionID,
      numberLocale,
      initialUiState,
      routing = null,
      insights = undefined,
      searchFunction,
      stalledSearchDelay = 200,
      searchClient = null,
      insightsClient = null,
      onStateChange,
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

    warning(
      !searchFunction,
      `The \`searchFunction\` option is deprecated. Use \`onStateChange\` instead.`
    );

    super({
      indexName,
      compositionID,
      searchClient,
      initialUiState,
      onStateChange,
      future,
      stalledSearchDelay,
      searchFunction,
    });

    this._initialOptions = options as unknown as InstantSearchOptions;
    this.insightsClient = insightsClient;

    this.templatesConfig = {
      helpers: createHelpers({ numberLocale }),
      compileOptions: {},
    };

    this._insights = insights;

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
  public addWidgets(
    widgets: Array<Widget | IndexWidget | Array<IndexWidget | Widget>>
  ) {
    if (!Array.isArray(widgets)) {
      throw new Error(
        withUsage(
          'The `addWidgets` method expects an array of widgets. Please use `addWidget`.'
        )
      );
    }

    if (
      this.compositionID &&
      widgets.some((w) => !Array.isArray(w) && isIndexWidget(w) && !w._isolated)
    ) {
      throw new Error(
        withUsage(
          'The `index` widget cannot be used with a composition-based InstantSearch implementation.'
        )
      );
    }

    return super.addWidgets(widgets);
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
  public removeWidgets(widgets: Array<Widget | IndexWidget | Widget[]>) {
    if (!Array.isArray(widgets)) {
      throw new Error(
        withUsage(
          'The `removeWidgets` method expects an array of widgets. Please use `removeWidget`.'
        )
      );
    }

    return super.removeWidgets(widgets);
  }

  public _afterStart() {
    // This is the automatic Insights middleware,
    // added when `insights` is unset and the initial results possess `queryID`.
    // Any user-provided middleware will be added later and override this one.
    if (typeof this._insights === 'undefined') {
      this.mainHelper!.derivedHelpers[0].once('result', () => {
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
    super.dispose();

    // Cleared after unsubscribe so in-flight readers (e.g. the insights
    // start-event listener) have detached before the reference goes away.
    this._initialOptions = null;
  }
}

export default InstantSearch;
