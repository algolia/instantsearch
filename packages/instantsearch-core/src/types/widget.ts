import type { InstantSearch } from '../instantsearch';
import type {
  IndexInitOptions,
  IndexRenderOptions,
  IndexWidgetDescription,
  IndexWidgetParams,
} from '../widgets/index-widget';
import type { RecommendResponse } from './algoliasearch';
import type { IndexRenderState, WidgetRenderState } from './render-state';
import type { IndexUiState, UiState } from './ui-state';
import type { Expand, RequiredKeys } from './utils';
import type {
  AlgoliaSearchHelper as Helper,
  SearchParameters,
  SearchResults,
  RecommendParameters,
} from 'algoliasearch-helper';

export type ScopedResult = {
  indexId: string;
  results: SearchResults;
  helper: Helper;
};

type SharedRenderOptions = {
  instantSearchInstance: InstantSearch;
  parent: IndexWidget;
  scopedResults: ScopedResult[];
  state: SearchParameters;
  renderState: IndexRenderState;
  helper: Helper;
  /** @deprecated use `status` instead */
  searchMetadata: {
    /** @deprecated use `status === "stalled"` instead */
    isSearchStalled: boolean;
  };
  status: InstantSearch['status'];
  error: InstantSearch['error'];
  createURL: (
    nextState: SearchParameters | ((state: IndexUiState) => IndexUiState)
  ) => string;
};

export type InitOptions = SharedRenderOptions & {
  uiState: UiState;
  results?: undefined;
};

export type ShouldRenderOptions = { instantSearchInstance: InstantSearch };

export type RenderOptions = SharedRenderOptions & {
  results: SearchResults;
};

export type DisposeOptions = {
  helper: Helper;
  state: SearchParameters;
  recommendState: RecommendParameters;
  parent: IndexWidget;
};

// @MAJOR: Remove these exported types if we don't need them
export type BuiltinTypes =
  | 'ais.autocomplete'
  | 'ais.breadcrumb'
  | 'ais.clearRefinements'
  | 'ais.configure'
  | 'ais.currentRefinements'
  | 'ais.dynamicWidgets'
  | 'ais.frequentlyBoughtTogether'
  | 'ais.geoSearch'
  | 'ais.hierarchicalMenu'
  | 'ais.hits'
  | 'ais.hitsPerPage'
  | 'ais.index'
  | 'ais.infiniteHits'
  | 'ais.lookingSimilar'
  | 'ais.menu'
  | 'ais.numericMenu'
  | 'ais.pagination'
  | 'ais.poweredBy'
  | 'ais.queryRules'
  // @TODO: remove individual types for rangeSlider & rangeInput once updating checkIndexUiState
  | 'ais.range'
  | 'ais.rangeSlider'
  | 'ais.rangeInput'
  | 'ais.ratingMenu'
  | 'ais.refinementList'
  | 'ais.relatedProducts'
  | 'ais.searchBox'
  | 'ais.relevantSort'
  | 'ais.sortBy'
  | 'ais.stats'
  | 'ais.toggleRefinement'
  | 'ais.trendingItems'
  | 'ais.voiceSearch';

export type BuiltinWidgetTypes =
  | 'ais.autocomplete'
  | 'ais.breadcrumb'
  | 'ais.clearRefinements'
  | 'ais.configure'
  | 'ais.currentRefinements'
  | 'ais.dynamicWidgets'
  | 'ais.frequentlyBoughtTogether'
  | 'ais.geoSearch'
  | 'ais.hierarchicalMenu'
  | 'ais.hits'
  | 'ais.hitsPerPage'
  | 'ais.index'
  | 'ais.infiniteHits'
  | 'ais.lookingSimilar'
  | 'ais.menu'
  | 'ais.menuSelect'
  | 'ais.numericMenu'
  | 'ais.pagination'
  | 'ais.poweredBy'
  | 'ais.queryRuleCustomData'
  | 'ais.queryRuleContext'
  | 'ais.rangeInput'
  | 'ais.rangeSlider'
  | 'ais.ratingMenu'
  | 'ais.refinementList'
  | 'ais.relatedProducts'
  | 'ais.searchBox'
  | 'ais.relevantSort'
  | 'ais.sortBy'
  | 'ais.stats'
  | 'ais.toggleRefinement'
  | 'ais.trendingItems'
  | 'ais.voiceSearch';

export type UnknownWidgetParams = NonNullable<object>;

export type WidgetParams = {
  widgetParams?: UnknownWidgetParams;
};

export type WidgetDescription = {
  $$type: string;
  $$widgetType?: string;
  renderState?: Record<string, unknown>;
  indexRenderState?: Record<string, unknown>;
  indexUiState?: Record<string, unknown>;
};

type SearchWidget<TWidgetDescription extends WidgetDescription> = {
  dependsOn?: 'search';
  getWidgetParameters?: (
    state: SearchParameters,
    widgetParametersOptions: {
      uiState: Expand<
        Partial<TWidgetDescription['indexUiState'] & IndexUiState>
      >;
    }
  ) => SearchParameters;
  $$id?: never;
};

type RecommendRenderOptions = SharedRenderOptions & {
  results: RecommendResponse<any>;
};

type RecommendWidget<
  TWidgetDescription extends WidgetDescription & WidgetParams
> = {
  dependsOn: 'recommend';
  $$id?: number;
  getWidgetParameters: (
    state: RecommendParameters,
    widgetParametersOptions: {
      uiState: Expand<
        Partial<TWidgetDescription['indexUiState'] & IndexUiState>
      >;
    }
  ) => RecommendParameters;
  getRenderState: (
    renderState: Expand<
      IndexRenderState & Partial<TWidgetDescription['indexRenderState']>
    >,
    renderOptions: InitOptions | RecommendRenderOptions
  ) => IndexRenderState & TWidgetDescription['indexRenderState'];
  getWidgetRenderState: (
    renderOptions: InitOptions | RecommendRenderOptions
  ) => Expand<
    WidgetRenderState<
      TWidgetDescription['renderState'],
      TWidgetDescription['widgetParams']
    >
  >;
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
   * Whether `render` should be called
   */
  shouldRender?: (options: ShouldRenderOptions) => boolean;
  /**
   * Called after each search response has been received.
   */
  render?: (options: RenderOptions) => void;
  /**
   * Called when this widget is unmounted. Used to remove refinements set by
   * during this widget's initialization and life time.
   */
  dispose?: (
    options: DisposeOptions
  ) => SearchParameters | RecommendParameters | void;
};

type RequiredWidgetType<TWidgetDescription extends WidgetDescription> = {
  /**
   * Identifier for widgets.
   */
  $$widgetType: TWidgetDescription['$$widgetType'];
};

type WidgetType<TWidgetDescription extends WidgetDescription> =
  TWidgetDescription extends RequiredKeys<WidgetDescription, '$$widgetType'>
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
  getWidgetState?: RequiredUiStateLifeCycle<TWidgetDescription>['getWidgetUiState'];

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

type UiStateLifeCycle<TWidgetDescription extends WidgetDescription> =
  TWidgetDescription extends RequiredKeys<WidgetDescription, 'indexUiState'>
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
  }
> = Expand<
  RequiredWidgetLifeCycle<TWidgetDescription> &
    WidgetType<TWidgetDescription> &
    UiStateLifeCycle<TWidgetDescription> &
    RenderStateLifeCycle<TWidgetDescription>
> &
  (SearchWidget<TWidgetDescription> | RecommendWidget<TWidgetDescription>);

export type IndexWidget<TUiState extends UiState = UiState> = Omit<
  Widget<IndexWidgetDescription & { widgetParams: IndexWidgetParams }>,
  'getWidgetUiState' | 'getWidgetState'
> & {
  // public API
  addWidgets: (widgets: Array<Widget | IndexWidget>) => IndexWidget;
  removeWidgets: (widgets: Array<Widget | IndexWidget>) => IndexWidget;

  // "private" API
  getIndexName: () => string;
  getIndexId: () => string;
  getHelper: () => Helper | null;
  getResults: () => SearchResults | null;
  getResultsForWidget: (
    widget: IndexWidget | Widget
  ) => SearchResults | RecommendResponse<any> | null;
  getPreviousState: () => SearchParameters | null;
  getScopedResults: () => ScopedResult[];
  getParent: () => IndexWidget | null;
  getWidgets: () => Array<Widget | IndexWidget>;
  createURL: (
    nextState: SearchParameters | ((state: IndexUiState) => IndexUiState)
  ) => string;
  /**
   * Set this index' UI state back to the state defined by the widgets.
   * Can only be called after `init`.
   */
  refreshUiState: () => void;
  /**
   * Set this index' UI state and search. This is the equivalent of calling
   * a spread `setUiState` on the InstantSearch instance.
   * Can only be called after `init`.
   */
  setIndexUiState: (
    indexUiState:
      | TUiState[string]
      | ((previousIndexUiState: TUiState[string]) => TUiState[string])
  ) => void;

  // widget lifecycle
  init: (options: IndexInitOptions) => void;
  render: (options: IndexRenderOptions) => void;
  dispose: (options?: DisposeOptions) => void;
  /**
   * @deprecated
   */
  getWidgetState: (uiState: UiState) => UiState;
  getWidgetUiState: <TSpecificUiState extends UiState = TUiState>(
    uiState: TSpecificUiState
  ) => TSpecificUiState;
  getWidgetSearchParameters: (
    searchParameters: SearchParameters,
    searchParametersOptions: { uiState: IndexUiState }
  ) => SearchParameters;
};

export type TransformItemsMetadata = {
  results?: SearchResults;
};

/**
 * Transforms the given items.
 */
export type TransformItems<TItem, TMetadata = TransformItemsMetadata> = (
  items: TItem[],
  metadata: TMetadata
) => TItem[];

type SortByDirection<TCriterion extends string> =
  | TCriterion
  | `${TCriterion}:asc`
  | `${TCriterion}:desc`;

/**
 * Transforms the given items.
 */
export type SortBy<TItem> =
  | ((a: TItem, b: TItem) => number)
  | Array<SortByDirection<'count' | 'name' | 'isRefined'>>;

/**
 * Creates the URL for the given value.
 */
export type CreateURL<TValue> = (value: TValue) => string;