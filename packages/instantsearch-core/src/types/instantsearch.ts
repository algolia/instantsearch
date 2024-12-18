import type { SearchClient } from './algoliasearch';
import type { InsightsProps } from './insights';
import type { RouterProps } from './router';
import type { UiState } from './ui-state';
import type { AlgoliaSearchHelper } from 'algoliasearch-helper';

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
    preserveSharedStateOnUnmount?: boolean; // @MAJOR remove option, only keep the "true" behaviour
    /**
     * Changes the way root levels of hierarchical facets have their count displayed.
     *
     * If `false` (by default), the count of the refined root level is updated to match the count of the actively refined parent level.
     *
     * If `true`, the count of the root level stays the same as the count of all children levels.
     *
     * @default true
     */
    persistHierarchicalRootCount?: boolean; // @MAJOR remove the option
  };
};

export type InstantSearchStatus = 'idle' | 'loading' | 'stalled' | 'error';
