import type {
  AutocompleteWidgetDescription,
  ConfigureWidgetDescription,
  GeoSearchWidgetDescription,
  HierarchicalMenuWidgetDescription,
  HitsPerPageWidgetDescription,
  InfiniteHitsWidgetDescription,
  MenuWidgetDescription,
  NumericMenuWidgetDescription,
  PaginationWidgetDescription,
  RangeWidgetDescription,
  RatingMenuWidgetDescription,
  RefinementListWidgetDescription,
  RelevantSortWidgetDescription,
  SearchBoxWidgetDescription,
  SortByWidgetDescription,
  ToggleRefinementWidgetDescription,
  VoiceSearchWidgetDescription,
} from '../connectors';

type ConnectorUiStates = AutocompleteWidgetDescription['indexUiState'] &
  ConfigureWidgetDescription['indexUiState'] &
  GeoSearchWidgetDescription['indexUiState'] &
  HierarchicalMenuWidgetDescription['indexUiState'] &
  HitsPerPageWidgetDescription['indexUiState'] &
  InfiniteHitsWidgetDescription['indexUiState'] &
  MenuWidgetDescription['indexUiState'] &
  NumericMenuWidgetDescription['indexUiState'] &
  PaginationWidgetDescription['indexUiState'] &
  RangeWidgetDescription['indexUiState'] &
  RatingMenuWidgetDescription['indexUiState'] &
  RefinementListWidgetDescription['indexUiState'] &
  RelevantSortWidgetDescription['indexUiState'] &
  SearchBoxWidgetDescription['indexUiState'] &
  SortByWidgetDescription['indexUiState'] &
  ToggleRefinementWidgetDescription['indexUiState'] &
  VoiceSearchWidgetDescription['indexUiState'];

export type IndexUiState = Partial<ConnectorUiStates>;

export type UiState = {
  [indexId: string]: IndexUiState;
};
