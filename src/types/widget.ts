import { Index } from '../widgets/index/index';
import {
  AlgoliaSearchHelper as Helper,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import { InstantSearch } from './instantsearch';
import { IndexUiState, UiState } from './ui-state';
import { IndexRenderState } from './render-state';

export type ScopedResult = {
  indexId: string;
  results: SearchResults;
  helper: Helper;
};

type SharedRenderOptions = {
  instantSearchInstance: InstantSearch;
  parent: Index | null;
  templatesConfig: Record<string, unknown>;
  scopedResults: ScopedResult[];
  state: SearchParameters;
  renderState: IndexRenderState;
  helper: Helper;
  searchMetadata: {
    isSearchStalled: boolean;
  };
  createURL(state: SearchParameters): string;
};

export type InitOptions = SharedRenderOptions & {
  uiState: UiState;
  results?: undefined;
};

export type RenderOptions = SharedRenderOptions & {
  results: SearchResults;
};

export type DisposeOptions = {
  helper: Helper;
  state: SearchParameters;
};

export type BuiltinTypes =
  | 'ais.analytics'
  | 'ais.answers'
  | 'ais.autocomplete'
  | 'ais.breadcrumb'
  | 'ais.clearRefinements'
  | 'ais.configure'
  | 'ais.configureRelatedItems'
  | 'ais.currentRefinements'
  | 'ais.geoSearch'
  | 'ais.hierarchicalMenu'
  | 'ais.hits'
  | 'ais.hitsPerPage'
  | 'ais.index'
  | 'ais.infiniteHits'
  | 'ais.menu'
  | 'ais.numericMenu'
  | 'ais.pagination'
  | 'ais.places'
  | 'ais.poweredBy'
  | 'ais.queryRules'
  // @TODO: remove individual types for rangeSlider & rangeInput once updating checkIndexUiState
  | 'ais.range'
  | 'ais.rangeSlider'
  | 'ais.rangeInput'
  | 'ais.ratingMenu'
  | 'ais.refinementList'
  | 'ais.searchBox'
  | 'ais.relevantSort'
  | 'ais.sortBy'
  | 'ais.stats'
  | 'ais.toggleRefinement'
  | 'ais.voiceSearch';

export type BuiltinWidgetTypes =
  | 'ais.analytics'
  | 'ais.answers'
  | 'ais.autocomplete'
  | 'ais.breadcrumb'
  | 'ais.clearRefinements'
  | 'ais.configure'
  | 'ais.configureRelatedItems'
  | 'ais.currentRefinements'
  | 'ais.geoSearch'
  | 'ais.hierarchicalMenu'
  | 'ais.hits'
  | 'ais.hitsPerPage'
  | 'ais.index'
  | 'ais.infiniteHits'
  | 'ais.menu'
  | 'ais.menuSelect'
  | 'ais.numericMenu'
  | 'ais.pagination'
  | 'ais.places'
  | 'ais.poweredBy'
  | 'ais.queryRuleCustomData'
  | 'ais.queryRuleContext'
  | 'ais.rangeInput'
  | 'ais.rangeSlider'
  | 'ais.ratingMenu'
  | 'ais.refinementList'
  | 'ais.searchBox'
  | 'ais.relevantSort'
  | 'ais.sortBy'
  | 'ais.stats'
  | 'ais.toggleRefinement'
  | 'ais.voiceSearch';

/**
 * Widgets are the building blocks of InstantSearch.js. Any valid widget must
 * have at least a `render` or a `init` function.
 */
export type Widget<
  TWidgetOptions extends { renderState: unknown } = { renderState: unknown }
> = {
  /**
   * Identifier for official connectors and widgets
   */
  $$type?: BuiltinTypes;

  /**
   * Identifier for official widgets
   */
  $$widgetType?: BuiltinWidgetTypes;

  /**
   * Called once before the first search
   */
  init?(options: InitOptions): void;
  /**
   * Called after each search response has been received
   */
  render?(options: RenderOptions): void;
  /**
   * Called when this widget is unmounted. Used to remove refinements set by
   * during this widget's initialization and life time.
   */
  dispose?(options: DisposeOptions): SearchParameters | void;
  /**
   * This function is required for a widget to be taken in account for routing.
   * It will derive a uiState for this widget based on the existing uiState and
   * the search parameters applied.
   * @param uiState current state
   * @param widgetStateOptions extra information to calculate uiState
   */
  getWidgetUiState?(
    uiState: IndexUiState,
    widgetUiStateOptions: {
      searchParameters: SearchParameters;
      helper: Helper;
    }
  ): IndexUiState;
  /**
   * This function is required for a widget to be taken in account for routing.
   * It will derive a uiState for this widget based on the existing uiState and
   * the search parameters applied.
   * @deprecated Use `getWidgetUiState` instead.
   * @param uiState current state
   * @param widgetStateOptions extra information to calculate uiState
   */
  getWidgetState?: Widget<TWidgetOptions>['getWidgetUiState'];
  /**
   * This function is required for a widget to behave correctly when a URL is
   * loaded via e.g. routing. It receives the current UiState and applied search
   * parameters, and is expected to return a new search parameters.
   * @param state applied search parameters
   * @param widgetSearchParametersOptions extra information to calculate next searchParameters
   */
  getWidgetSearchParameters?(
    state: SearchParameters,
    widgetSearchParametersOptions: {
      uiState: IndexUiState;
    }
  ): SearchParameters;
} & (TWidgetOptions['renderState'] extends Record<string, unknown>
  ? {
      /**
       * Returns the render state of the current widget to pass to the render function.
       */
      getWidgetRenderState(
        renderOptions: InitOptions | RenderOptions
      ): TWidgetOptions['renderState'];
      /**
       * Returns IndexRenderState of the current index component tree
       * to build the render state of the whole app.
       */
      getRenderState(
        renderState: IndexRenderState,
        renderOptions: InitOptions | RenderOptions
      ): IndexRenderState;
    }
  : {
      /**
       * Returns the render state of the current widget to pass to the render function.
       */
      getWidgetRenderState?(
        renderOptions: InitOptions | RenderOptions
      ): unknown;
      /**
       * Returns IndexRenderState of the current index component tree
       * to build the render state of the whole app.
       */
      getRenderState?(
        renderState: IndexRenderState,
        renderOptions: InitOptions | RenderOptions
      ): IndexRenderState;
    });
