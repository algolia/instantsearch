import { AnswersWidgetDescription } from '../connectors/answers/connectAnswers';
import { AutocompleteWidgetDescription } from '../connectors/autocomplete/connectAutocomplete';
import { BreadcrumbWidgetDescription } from '../connectors/breadcrumb/connectBreadcrumb';
import { ClearRefinementsWidgetDescription } from '../connectors/clear-refinements/connectClearRefinements';
import { ConfigureWidgetDescription } from '../connectors/configure/connectConfigure';
import { CurrentRefinementsWidgetDescription } from '../connectors/current-refinements/connectCurrentRefinements';
import { GeoSearchWidgetDescription } from '../connectors/geo-search/types';
import { HierarchicalMenuWidgetDescription } from '../connectors/hierarchical-menu/connectHierarchicalMenu';
import { HitsPerPageWidgetDescription } from '../connectors/hits-per-page/connectHitsPerPage';
import { HitsWidgetDescription } from '../connectors/hits/connectHits';
import { InfiniteHitsWidgetDescription } from '../connectors/infinite-hits/connectInfiniteHits';
import { MenuWidgetDescription } from '../connectors/menu/connectMenu';
import { NumericMenuWidgetDescription } from '../connectors/numeric-menu/connectNumericMenu';
import { PaginationWidgetDescription } from '../connectors/pagination/connectPagination';
import { PoweredByWidgetDescription } from '../connectors/powered-by/connectPoweredBy';
import { QueryRulesWidgetDescription } from '../connectors/query-rules/connectQueryRules';
import { RangeWidgetDescription } from '../connectors/range/connectRange';
import { RatingMenuWidgetDescription } from '../connectors/rating-menu/connectRatingMenu';
import { RefinementListWidgetDescription } from '../connectors/refinement-list/connectRefinementList';
import { RelevantSortWidgetDescription } from '../connectors/relevant-sort/connectRelevantSort';
import { SearchBoxWidgetDescription } from '../connectors/search-box/connectSearchBox';
import { SortByWidgetDescription } from '../connectors/sort-by/connectSortBy';
import { StatsWidgetDescription } from '../connectors/stats/connectStats';
import { ToggleRefinementWidgetDescription } from '../connectors/toggle-refinement/connectToggleRefinement';
import { VoiceSearchWidgetDescription } from '../connectors/voice-search/connectVoiceSearch';
import { AnalyticsWidgetDescription } from '../widgets/analytics/analytics';
import { PlacesWidgetDescription } from '../widgets/places/places';

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

export type WidgetRenderState<
  TWidgetRenderState,
  TWidgetParams
> = TWidgetRenderState & {
  widgetParams: TWidgetParams;
};
