import type { AnswersWidgetDescription } from '../connectors/answers/connectAnswers.js';
import type { AutocompleteWidgetDescription } from '../connectors/autocomplete/connectAutocomplete.js';
import type { BreadcrumbWidgetDescription } from '../connectors/breadcrumb/connectBreadcrumb.js';
import type { ClearRefinementsWidgetDescription } from '../connectors/clear-refinements/connectClearRefinements.js';
import type { ConfigureWidgetDescription } from '../connectors/configure/connectConfigure.js';
import type { CurrentRefinementsWidgetDescription } from '../connectors/current-refinements/connectCurrentRefinements.js';
import type { GeoSearchWidgetDescription } from '../connectors/geo-search/connectGeoSearch.js';
import type { HierarchicalMenuWidgetDescription } from '../connectors/hierarchical-menu/connectHierarchicalMenu.js';
import type { HitsPerPageWidgetDescription } from '../connectors/hits-per-page/connectHitsPerPage.js';
import type { HitsWidgetDescription } from '../connectors/hits/connectHits.js';
import type { InfiniteHitsWidgetDescription } from '../connectors/infinite-hits/connectInfiniteHits.js';
import type { MenuWidgetDescription } from '../connectors/menu/connectMenu.js';
import type { NumericMenuWidgetDescription } from '../connectors/numeric-menu/connectNumericMenu.js';
import type { PaginationWidgetDescription } from '../connectors/pagination/connectPagination.js';
import type { PoweredByWidgetDescription } from '../connectors/powered-by/connectPoweredBy.js';
import type { QueryRulesWidgetDescription } from '../connectors/query-rules/connectQueryRules.js';
import type { RangeWidgetDescription } from '../connectors/range/connectRange.js';
import type { RatingMenuWidgetDescription } from '../connectors/rating-menu/connectRatingMenu.js';
import type { RefinementListWidgetDescription } from '../connectors/refinement-list/connectRefinementList.js';
import type { RelevantSortWidgetDescription } from '../connectors/relevant-sort/connectRelevantSort.js';
import type { SearchBoxWidgetDescription } from '../connectors/search-box/connectSearchBox.js';
import type { SortByWidgetDescription } from '../connectors/sort-by/connectSortBy.js';
import type { StatsWidgetDescription } from '../connectors/stats/connectStats.js';
import type { ToggleRefinementWidgetDescription } from '../connectors/toggle-refinement/connectToggleRefinement.js';
import type { VoiceSearchWidgetDescription } from '../connectors/voice-search/connectVoiceSearch.js';
import type { AnalyticsWidgetDescription } from '../widgets/analytics/analytics.js';
import type { PlacesWidgetDescription } from '../widgets/places/places.js';

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
