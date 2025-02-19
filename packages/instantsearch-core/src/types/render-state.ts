import type {
  AutocompleteWidgetDescription,
  BreadcrumbWidgetDescription,
  ClearRefinementsWidgetDescription,
  ConfigureWidgetDescription,
  CurrentRefinementsWidgetDescription,
  GeoSearchWidgetDescription,
  HierarchicalMenuWidgetDescription,
  HitsWidgetDescription,
  HitsPerPageWidgetDescription,
  InfiniteHitsWidgetDescription,
  MenuWidgetDescription,
  NumericMenuWidgetDescription,
  PaginationWidgetDescription,
  PoweredByWidgetDescription,
  QueryRulesWidgetDescription,
  RangeWidgetDescription,
  RatingMenuWidgetDescription,
  RefinementListWidgetDescription,
  RelevantSortWidgetDescription,
  SearchBoxWidgetDescription,
  SortByWidgetDescription,
  StatsWidgetDescription,
  ToggleRefinementWidgetDescription,
  VoiceSearchWidgetDescription,
} from '../connectors';

type ConnectorRenderStates = AutocompleteWidgetDescription['indexRenderState'] &
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

export type IndexRenderState = Partial<ConnectorRenderStates>;

export type RenderState = {
  [indexId: string]: IndexRenderState;
};

export type WidgetRenderState<TWidgetRenderState, TWidgetParams> =
  TWidgetRenderState & {
    widgetParams: TWidgetParams;
  };
