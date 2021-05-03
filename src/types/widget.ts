import { IndexWidget } from '../widgets/index/index';
import {
  AlgoliaSearchHelper as Helper,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import { InstantSearch } from './instantsearch';
import { IndexUiState, UiState } from './ui-state';
import { IndexRenderState, WidgetRenderState } from './render-state';
import { Expand, RequiredKeys } from './utils';

export type ScopedResult = {
  indexId: string;
  results: SearchResults;
  helper: Helper;
};

type SharedRenderOptions = {
  instantSearchInstance: InstantSearch;
  parent: IndexWidget | null;
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
  parent: IndexWidget;
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
  | 'ais.dynamicWidgets'
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
  | 'ais.dynamicWidgets'
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

export type WidgetParams = {
  widgetParams: NonNullable<unknown>;
};

export type WidgetDescription = {
  $$type: string;
  $$widgetType?: string;
  renderState?: Record<string, unknown>;
  indexRenderState?: Record<string, unknown>;
  indexUiState?: Record<string, unknown>;
};

type RequiredWidgetLifeCycle<TWidgetDescription extends WidgetDescription> = {
  /**
   * Identifier for connectors and widgets.
   */
  $$type: TWidgetDescription['$$type'];

  /**
   * Called once before the first search.
   */
  init?: (options: InitOptions) => void;
  /**
   * Called after each search response has been received.
   */
  render?: (options: RenderOptions) => void;
  /**
   * Called when this widget is unmounted. Used to remove refinements set by
   * during this widget's initialization and life time.
   */
  dispose?: (options: DisposeOptions) => SearchParameters | void;
};

type RequiredWidgetType<TWidgetDescription extends WidgetDescription> = {
  /**
   * Identifier for widgets.
   */
  $$widgetType: TWidgetDescription['$$widgetType'];
};

type WidgetType<
  TWidgetDescription extends WidgetDescription
> = TWidgetDescription extends RequiredKeys<WidgetDescription, '$$widgetType'>
  ? RequiredWidgetType<TWidgetDescription>
  : {
      /**
       * Identifier for widgets.
       */
      $$widgetType?: string;
    };

type RequiredUiStateLifeCycle<TWidgetDescription extends WidgetDescription> = {
  /**
   * This function is required for a widget to be taken in account for routing.
   * It will derive a uiState for this widget based on the existing uiState and
   * the search parameters applied.
   *
   * @param uiState - Current state.
   * @param widgetStateOptions - Extra information to calculate uiState.
   */
  getWidgetUiState: (
    uiState: Expand<Partial<TWidgetDescription['indexUiState'] & IndexUiState>>,
    widgetUiStateOptions: {
      searchParameters: SearchParameters;
      helper: Helper;
    }
  ) => Partial<IndexUiState & TWidgetDescription['indexUiState']>;

  /**
   * This function is required for a widget to be taken in account for routing.
   * It will derive a uiState for this widget based on the existing uiState and
   * the search parameters applied.
   *
   * @deprecated Use `getWidgetUiState` instead.
   * @param uiState - Current state.
   * @param widgetStateOptions - Extra information to calculate uiState.
   */
  getWidgetState?: RequiredUiStateLifeCycle<
    TWidgetDescription
  >['getWidgetUiState'];

  /**
   * This function is required for a widget to behave correctly when a URL is
   * loaded via e.g. Routing. It receives the current UiState and applied search
   * parameters, and is expected to return a new search parameters.
   *
   * @param state - Applied search parameters.
   * @param widgetSearchParametersOptions - Extra information to calculate next searchParameters.
   */
  getWidgetSearchParameters: (
    state: SearchParameters,
    widgetSearchParametersOptions: {
      uiState: Expand<
        Partial<TWidgetDescription['indexUiState'] & IndexUiState>
      >;
    }
  ) => SearchParameters;
};

type UiStateLifeCycle<
  TWidgetDescription extends WidgetDescription
> = TWidgetDescription extends RequiredKeys<WidgetDescription, 'indexUiState'>
  ? RequiredUiStateLifeCycle<TWidgetDescription>
  : Partial<RequiredUiStateLifeCycle<TWidgetDescription>>;

type RequiredRenderStateLifeCycle<
  TWidgetDescription extends WidgetDescription & WidgetParams
> = {
  /**
   * Returns the render state of the current widget to pass to the render function.
   */
  getWidgetRenderState: (
    renderOptions: InitOptions | RenderOptions
  ) => Expand<
    WidgetRenderState<
      TWidgetDescription['renderState'],
      TWidgetDescription['widgetParams']
    >
  >;
  /**
   * Returns IndexRenderState of the current index component tree
   * to build the render state of the whole app.
   */
  getRenderState: (
    renderState: Expand<
      IndexRenderState & Partial<TWidgetDescription['indexRenderState']>
    >,
    renderOptions: InitOptions | RenderOptions
  ) => IndexRenderState & TWidgetDescription['indexRenderState'];
};

type RenderStateLifeCycle<
  TWidgetDescription extends WidgetDescription & WidgetParams
> = TWidgetDescription extends RequiredKeys<
  WidgetDescription,
  'renderState' | 'indexRenderState'
> &
  WidgetParams
  ? RequiredRenderStateLifeCycle<TWidgetDescription>
  : Partial<RequiredRenderStateLifeCycle<TWidgetDescription>>;

export type Widget<
  TWidgetDescription extends WidgetDescription & WidgetParams = {
    $$type: string;
    widgetParams: unknown;
  }
> = Expand<
  RequiredWidgetLifeCycle<TWidgetDescription> &
    WidgetType<TWidgetDescription> &
    UiStateLifeCycle<TWidgetDescription> &
    RenderStateLifeCycle<TWidgetDescription>
>;

/**
 * Transforms the given items.
 */
export type TransformItems<TItem> = (items: TItem[]) => TItem[];

/**
 * Transforms the given items.
 */
export type SortBy<TItem> =
  | ((a: TItem, b: TItem) => number)
  | Array<'count' | 'isRefined' | 'name:asc' | 'name:desc'>;

/**
 * Creates the URL for the given value.
 */
export type CreateURL<TValue> = (value: TValue) => string;
