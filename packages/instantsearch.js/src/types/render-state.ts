import type { AnswersWidgetDescription } from '../connectors/answers/connectAnswers';
import type { AutocompleteWidgetDescription } from '../connectors/autocomplete/connectAutocomplete';
import type { BreadcrumbWidgetDescription } from '../connectors/breadcrumb/connectBreadcrumb';
import type { ClearRefinementsWidgetDescription } from '../connectors/clear-refinements/connectClearRefinements';
import type { ConfigureWidgetDescription } from '../connectors/configure/connectConfigure';
import type { CurrentRefinementsWidgetDescription } from '../connectors/current-refinements/connectCurrentRefinements';
import type { GeoSearchWidgetDescription } from '../connectors/geo-search/connectGeoSearch';
import type { HierarchicalMenuWidgetDescription } from '../connectors/hierarchical-menu/connectHierarchicalMenu';
import type { HitsPerPageWidgetDescription } from '../connectors/hits-per-page/connectHitsPerPage';
import type { HitsWidgetDescription } from '../connectors/hits/connectHits';
import type { InfiniteHitsWidgetDescription } from '../connectors/infinite-hits/connectInfiniteHits';
import type { MenuWidgetDescription } from '../connectors/menu/connectMenu';
import type { NumericMenuWidgetDescription } from '../connectors/numeric-menu/connectNumericMenu';
import type { PaginationWidgetDescription } from '../connectors/pagination/connectPagination';
import type { PoweredByWidgetDescription } from '../connectors/powered-by/connectPoweredBy';
import type { QueryRulesWidgetDescription } from '../connectors/query-rules/connectQueryRules';
import type { RangeWidgetDescription } from '../connectors/range/connectRange';
import type { RatingMenuWidgetDescription } from '../connectors/rating-menu/connectRatingMenu';
import type { RefinementListWidgetDescription } from '../connectors/refinement-list/connectRefinementList';
import type { RelevantSortWidgetDescription } from '../connectors/relevant-sort/connectRelevantSort';
import type { SearchBoxWidgetDescription } from '../connectors/search-box/connectSearchBox';
import type { SortByWidgetDescription } from '../connectors/sort-by/connectSortBy';
import type { StatsWidgetDescription } from '../connectors/stats/connectStats';
import type { ToggleRefinementWidgetDescription } from '../connectors/toggle-refinement/connectToggleRefinement';
import type { VoiceSearchWidgetDescription } from '../connectors/voice-search/connectVoiceSearch';
import type { AnalyticsWidgetDescription } from '../widgets/analytics/analytics';
import type { PlacesWidgetDescription } from '../widgets/places/places';

type ConnectorRenderStates = AnswersWidgetDescription['indexRenderState'] &
  AutocompleteWidgetDescription['indexRenderState'] &
  BreadcrumbWidgetDescription['indexRenderState'] &
  ClearRefinementsWidgetDescription['indexRenderState'] &
  ConfigureWidgetDescription['indexRenderState'] &
  CurrentRefinementsWidgetDescription['indexRenderState'] &
  GeoSearchWidgetDescription['indexRenderState'] &
  HierarchicalMenuWidgetDescription['indexRenderState'] &
  HitsWidgetDescription['indexRenderState'] &
  HitsPerPageWidgetDescription['indexRenderState'] &
  InfiniteHitsWidgetDescription['indexRenderState'] &
  MenuWidgetDescription['indexRenderState'] &
  NumericMenuWidgetDescription['indexRenderState'] &
  PaginationWidgetDescription['indexRenderState'] &
  PoweredByWidgetDescription['indexRenderState'] &
  QueryRulesWidgetDescription['indexRenderState'] &
  RangeWidgetDescription['indexRenderState'] &
  RatingMenuWidgetDescription['indexRenderState'] &
  RefinementListWidgetDescription['indexRenderState'] &
  RelevantSortWidgetDescription['indexRenderState'] &
  SearchBoxWidgetDescription['indexRenderState'] &
  SortByWidgetDescription['indexRenderState'] &
  StatsWidgetDescription['indexRenderState'] &
  ToggleRefinementWidgetDescription['indexRenderState'] &
  VoiceSearchWidgetDescription['indexRenderState'];

type WidgetRenderStates = AnalyticsWidgetDescription['indexRenderState'] &
  PlacesWidgetDescription['indexRenderState'];

export type IndexRenderState = Partial<
  ConnectorRenderStates & WidgetRenderStates
>;

export type RenderState = {
  [indexId: string]: IndexRenderState;
};

export type WidgetRenderState<TWidgetRenderState, TWidgetParams> =
  TWidgetRenderState & {
    widgetParams: TWidgetParams;
  };
