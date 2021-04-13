import { Hit, GeoLoc } from './results';
import { SendEventForHits } from '../lib/utils';
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
  AnswersRendererOptions,
  AnswersConnectorParams,
} from '../connectors/answers/connectAnswers';
import {
  RatingMenuConnectorParams,
  RatingMenuRendererOptions,
} from '../connectors/rating-menu/connectRatingMenu';
import {
  RangeConnectorParams,
  RangeRendererOptions,
} from '../connectors/range/connectRange';
import {
  RelevantSortConnectorParams,
  RelevantSortRendererOptions,
} from '../connectors/relevant-sort/connectRelevantSort';
import {
  MenuConnectorParams,
  MenuRendererOptions,
} from '../connectors/menu/connectMenu';
import {
  HierarchicalMenuConnectorParams,
  HierarchicalMenuRendererOptions,
} from '../connectors/hierarchical-menu/connectHierarchicalMenu';
import {
  RefinementListRendererOptions,
  RefinementListConnectorParams,
} from '../connectors/refinement-list/connectRefinementList';
import {
  StatsConnectorParams,
  StatsRendererOptions,
} from '../connectors/stats/connectStats';
import {
  SortByConnectorParams,
  SortByRendererOptions,
} from '../connectors/sort-by/connectSortBy';

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
      queryHook?(query: string, refine: (value: string) => void): void;
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
  menu: {
    [attribute: string]: WidgetRenderState<
      MenuRendererOptions,
      MenuConnectorParams
    >;
  };
  hierarchicalMenu: {
    [attribute: string]: WidgetRenderState<
      HierarchicalMenuRendererOptions,
      HierarchicalMenuConnectorParams
    >;
  };
  hits: WidgetRenderState<HitsRendererOptions, HitsConnectorParams>;
  infiniteHits: WidgetRenderState<
    InfiniteHitsRendererOptions,
    InfiniteHitsConnectorParams
  >;
  analytics: WidgetRenderState<unknown, AnalyticsWidgetParams>;
  places: WidgetRenderState<unknown, PlacesWidgetParams>;
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
      RatingMenuRendererOptions,
      RatingMenuConnectorParams
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
    sendEvent: SendEventForHits;
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
      RefinementListRendererOptions,
      RefinementListConnectorParams
    >;
  };
  answers: WidgetRenderState<AnswersRendererOptions, AnswersConnectorParams>;
  relevantSort: WidgetRenderState<
    RelevantSortRendererOptions,
    RelevantSortConnectorParams
  >;
  sortBy: WidgetRenderState<SortByRendererOptions, SortByConnectorParams>;
  stats: WidgetRenderState<StatsRendererOptions, StatsConnectorParams>;
}>;

export type WidgetRenderState<
  TWidgetRenderState,
  TWidgetParams
> = TWidgetRenderState & {
  widgetParams: TWidgetParams;
};
