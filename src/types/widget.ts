import { Index } from '../widgets/index/index';
import { CreateURL } from '.';
import {
  AlgoliaSearchHelper as Helper,
  SearchParameters,
  SearchResults,
  PlainSearchParameters,
} from 'algoliasearch-helper';
import { InstantSearch, Hit, GeoLoc } from './instantsearch';
import { BindEventForHits } from '../lib/utils';
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
import {
  HitsPerPageConnectorParams,
  HitsPerPageRendererOptions,
} from '../connectors/hits-per-page/connectHitsPerPage';
import {
  HitsRendererOptions,
  HitsConnectorParams,
} from '../connectors/hits/connectHits';
import {
  InfiniteHitsRendererOptions,
  InfiniteHitsConnectorParams,
} from '../connectors/infinite-hits/connectInfiniteHits';
import { AnalyticsWidgetParams } from '../widgets/analytics/analytics';
import { PlacesWidgetParams } from '../widgets/places/places';
import {
  NumericMenuConnectorParams,
  NumericMenuRendererOptions,
} from '../connectors/numeric-menu/connectNumericMenu';
import {
  PoweredByConnectorParams,
  PoweredByRendererOptions,
} from '../connectors/powered-by/connectPoweredBy';
import {
  VoiceSearchRendererOptions,
  VoiceSearchConnectorParams,
} from '../connectors/voice-search/connectVoiceSearch';
import {
  QueryRulesRendererOptions,
  QueryRulesConnectorParams,
} from '../connectors/query-rules/connectQueryRules';
import {
  PaginationRendererOptions,
  PaginationConnectorParams,
} from '../connectors/pagination/connectPagination';
import {
  RangeConnectorParams,
  RangeRendererOptions,
} from '../connectors/range/connectRange';

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
  breadcrumb: {
    [attribute: string]: WidgetRenderState<
      BreadcrumbRendererOptions,
      BreadcrumbConnectorParams
    >;
  };
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
  hierarchicalMenu: {
    [attribute: string]: WidgetRenderState<
      {
        items: any[];
        refine(facetValue: any): void;
        createURL(facetValue: any): string;
        isShowingMore: boolean;
        toggleShowMore(): void;
        canToggleShowMore: boolean;
      },
      {
        attributes: string[];
        separator: string;
        rootPath: string | null;
        showParentLevel: boolean;
        limit: number;
        showMore: boolean;
        showMoreLimit: number;
        sortBy: any;
        transformItems(items: any): any;
      }
    >;
  };
  hits: WidgetRenderState<HitsRendererOptions, HitsConnectorParams>;
  infiniteHits: WidgetRenderState<
    InfiniteHitsRendererOptions,
    InfiniteHitsConnectorParams
  >;
  analytics: WidgetRenderState<{}, AnalyticsWidgetParams>;
  places: WidgetRenderState<{}, PlacesWidgetParams>;
  poweredBy: WidgetRenderState<
    PoweredByRendererOptions,
    PoweredByConnectorParams
  >;
  range: {
    [attribute: string]: WidgetRenderState<
      RangeRendererOptions,
      RangeConnectorParams
    >;
  };
  ratingMenu: {
    [attribute: string]: WidgetRenderState<
      {
        items: Array<{
          stars: boolean[];
          name: string;
          value: string;
          count: number;
          isRefined: boolean;
        }>;
        hasNoResults: boolean;
        refine(value: number): void;
        createURL: CreateURL<string>;
      },
      {
        attribute: string;
        max?: number;
      }
    >;
  };
  numericMenu: {
    [attribute: string]: WidgetRenderState<
      NumericMenuRendererOptions,
      NumericMenuConnectorParams
    >;
  };
  voiceSearch: WidgetRenderState<
    VoiceSearchRendererOptions,
    VoiceSearchConnectorParams
  >;
  geoSearch: {
    currentRefinement?: {
      northEast: GeoLoc;
      southWest: GeoLoc;
    };
    position?: GeoLoc;
    items: Array<Hit & Required<Pick<Hit, '_geoLoc'>>>;
    refine(position: { northEast: GeoLoc; southWest: GeoLoc }): void;
    clearMapRefinement(): void;
    hasMapMoveSinceLastRefine(): boolean;
    isRefineOnMapMove(): boolean;
    isRefinedWithMap(): boolean;
    setMapMoveSinceLastRefine(): void;
    toggleRefineOnMapMove(): void;
    sendEvent: Function;
    widgetParams: any;
  };
  queryRules: WidgetRenderState<
    QueryRulesRendererOptions,
    QueryRulesConnectorParams
  >;
  hitsPerPage: WidgetRenderState<
    HitsPerPageRendererOptions,
    HitsPerPageConnectorParams
  >;
  pagination: WidgetRenderState<
    PaginationRendererOptions,
    PaginationConnectorParams
  >;
  refinementList: {
    [attribute: string]: WidgetRenderState<
      {
        createURL: CreateURL<string>;
        helperSpecializedSearchFacetValues: any;
        isFirstSearch: boolean;
        isFromSearch: boolean;
        isShowingMore: boolean;
        items: Array<{
          count: number;
          highlighted: string;
          isRefined: boolean;
          label: string;
          value: string;
        }>;
        refine(value: string): void;
        state: SearchParameters;
        toggleShowMore(): void;
      },
      {
        attribute: string;
        operator: string;
        limit: number;
        showMore: boolean;
        showMoreLimit: number;
        sortBy: ((firstItem: any, secondItem: any) => number) | string[];
        escapeFacetValues: boolean;
        transformItems(items: any): any;
      }
    >;
  };
}>;

export type WidgetRenderState<
  TWidgetRenderState,
  TWidgetParams
> = TWidgetRenderState & {
  widgetParams: TWidgetParams;
};

/**
 * Widgets are the building blocks of InstantSearch.js. Any valid widget must
 * have at least a `render` or a `init` function.
 */
export type Widget<
  TWidgetOptions extends { renderState: unknown } = { renderState: unknown }
> = {
  /**
   * identifier for official widgets
   */
  $$type?:
    | 'ais.analytics'
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
   * private marker on widgets to differentiate a widget from a connector
   */
  $$officialWidget?: boolean;

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
} & (TWidgetOptions['renderState'] extends object
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

/**
 * The function that creates a new widget.
 */
export type WidgetFactory<TRendererOptions, TConnectorParams, TWidgetParams> = (
  /**
   * The params of the widget.
   */
  widgetParams: TConnectorParams & TWidgetParams
) => Widget<{
  renderState: WidgetRenderState<
    TRendererOptions,
    // widgetParams sent to the connector of builtin widgets are actually
    // the connector params, therefore renderState uses TConnectorParams only
    TConnectorParams
  >;
}>;

export type Template<TTemplateData = void> =
  | string
  | ((data: TTemplateData) => string);

export type UnknownWidgetFactory = WidgetFactory<any, any, any>;

export type TemplateWithBindEvent<TTemplateData = void> =
  | string
  | ((data: TTemplateData, bindEvent: BindEventForHits) => string);
