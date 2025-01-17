import type { CompositionClient, SearchClient } from './algoliasearch';
import type { InsightsProps } from './insights';
import type { RouterProps } from './router';
import type { UiState } from './ui-state';

export type InstantSearchOptions<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
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
  future?: Record<string, never>;
};

export type InstantSearchStatus = 'idle' | 'loading' | 'stalled' | 'error';
