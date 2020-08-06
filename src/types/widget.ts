import { Index } from '../widgets/index/index';
import {
  AlgoliaSearchHelper as Helper,
  SearchParameters,
  SearchResults,
  PlainSearchParameters,
} from 'algoliasearch-helper';
import { InstantSearch } from './instantsearch';
import {
  AutocompleteRendererOptions,
  AutocompleteConnectorParams,
} from '../connectors/autocomplete/connectAutocomplete';
import {
  BreadcrumbRendererOptions,
  BreadcrumbConnectorParams,
} from '../connectors/breadcrumb/connectBreadcrumb';
import {
  ClearRefinementsRendererOptions,
  ClearRefinementsConnectorParams,
} from '../connectors/clear-refinements/connectClearRefinements';
import {
  ConfigureRendererOptions,
  ConfigureConnectorParams,
} from '../connectors/configure/connectConfigure';
import {
  CurrentRefinementsRendererOptions,
  CurrentRefinementsConnectorParams,
} from '../connectors/current-refinements/connectCurrentRefinements';

export type ScopedResult = {
  indexId: string;
  results: SearchResults;
  helper: Helper;
};

type SharedRenderOptions = {
  instantSearchInstance: InstantSearch;
  parent: Index | null;
  templatesConfig: object;
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

export type WidgetUiStateOptions = {
  searchParameters: SearchParameters;
  helper: Helper;
};

export type WidgetSearchParametersOptions = {
  uiState: IndexUiState;
};

export type IndexUiState = {
  query?: string;
  refinementList?: {
    [attribute: string]: string[];
  };
  menu?: {
    [attribute: string]: string;
  };
  /**
   * The list of hierarchical menus.
   * Nested levels must contain the record separator.
   *
   * @example ['Audio', 'Audio > Headphones']
   */
  hierarchicalMenu?: {
    [attribute: string]: string[];
  };
  /**
   * The numeric menu as a tuple.
   *
   * @example ':5'
   * @example '5:10'
   * @example '10:'
   */
  numericMenu?: {
    [attribute: string]: string;
  };
  ratingMenu?: {
    [attribute: string]: number;
  };
  /**
   * The range as a tuple.
   *
   * @example '100:500'
   */
  range?: {
    [attribute: string]: string;
  };
  toggle?: {
    [attribute: string]: boolean;
  };
  geoSearch?: {
    /**
     * The rectangular area in geo coordinates.
     * The rectangle is defined by two diagonally opposite points, hence by 4 floats separated by commas.
     *
     * @example '47.3165,4.9665,47.3424,5.0201'
     */
    boundingBox: string;
  };
  sortBy?: string;
  page?: number;
  hitsPerPage?: number;
  configure?: PlainSearchParameters;
  places?: {
    query: string;
    /**
     * The central geolocation.
     *
     * @example '48.8546,2.3477'
     */
    position: string;
  };
};

export type UiState = {
  [indexId: string]: IndexUiState;
};

export type RenderState = {
  [indexId: string]: IndexRenderState;
};

export type IndexRenderState = Partial<{
  searchBox: WidgetRenderState<
    {
      query: string;
      refine(query: string): void;
      clear(): void;
      isSearchStalled: boolean;
    },
    {
      queryHook?(query: string, refine: (query: string) => void);
    }
  >;
  autocomplete: WidgetRenderState<
    AutocompleteRendererOptions,
    AutocompleteConnectorParams
  >;
  breadcrumb: WidgetRenderState<
    BreadcrumbRendererOptions,
    BreadcrumbConnectorParams
  >;
  clearRefinements: WidgetRenderState<
    ClearRefinementsRendererOptions,
    ClearRefinementsConnectorParams
  >;
  configure: WidgetRenderState<
    ConfigureRendererOptions,
    ConfigureConnectorParams
  >;
  currentRefinements: WidgetRenderState<
    CurrentRefinementsRendererOptions,
    CurrentRefinementsConnectorParams
  >;
}>;

type WidgetRenderState<
  TWidgetRenderState,
  // @ts-ignore
  TWidgetParams
> = TWidgetRenderState & {
  widgetParams: any; // @TODO type as TWidgetParams
};

/**
 * Widgets are the building blocks of InstantSearch.js. Any valid widget must
 * have at least a `render` or a `init` function.
 */
export type Widget = {
  $$type?:
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
    | 'ais.queryRuleCustomData'
    | 'ais.queryRuleContext'
    | 'ais.range'
    | 'ais.rangeInput'
    | 'ais.rangeSlider'
    | 'ais.ratingMenu'
    | 'ais.refinementList'
    | 'ais.searchBox'
    | 'ais.sortBy'
    | 'ais.stats'
    | 'ais.toggleRefinement'
    | 'ais.voiceSearch';
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
   * Returns the render params to pass to the render function.
   */
  getWidgetRenderState?(
    renderState: IndexRenderState,
    widgetRenderStateOptions: InitOptions | RenderOptions
  ): IndexRenderState;
  /**
   * This function is required for a widget to be taken in account for routing.
   * It will derive a uiState for this widget based on the existing uiState and
   * the search parameters applied.
   * @param uiState current state
   * @param widgetStateOptions extra information to calculate uiState
   */
  getWidgetUiState?(
    uiState: IndexUiState,
    widgetUiStateOptions: WidgetUiStateOptions
  ): IndexUiState;
  /**
   * This function is required for a widget to be taken in account for routing.
   * It will derive a uiState for this widget based on the existing uiState and
   * the search parameters applied.
   * @deprecated Use `getWidgetUiState` instead.
   * @param uiState current state
   * @param widgetStateOptions extra information to calculate uiState
   */
  getWidgetState?(
    uiState: IndexUiState,
    widgetStateOptions: WidgetUiStateOptions
  ): IndexUiState;
  /**
   * This function is required for a widget to behave correctly when a URL is
   * loaded via e.g. routing. It receives the current UiState and applied search
   * parameters, and is expected to return a new search parameters.
   * @param state applied search parameters
   * @param widgetSearchParametersOptions extra information to calculate next searchParameters
   */
  getWidgetSearchParameters?(
    state: SearchParameters,
    widgetSearchParametersOptions: WidgetSearchParametersOptions
  ): SearchParameters;
};

/**
 * The function that creates a new widget.
 */
export type WidgetFactory<TConnectorParams, TWidgetParams> = (
  /**
   * The params of the widget.
   */
  widgetParams: TConnectorParams & TWidgetParams
) => Widget;

export type Template<TTemplateData = void> =
  | string
  | ((data: TTemplateData) => string);
