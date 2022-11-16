import type { AutocompleteWidgetDescription } from '../connectors/autocomplete/connectAutocomplete';
import type { ConfigureWidgetDescription } from '../connectors/configure/connectConfigure';
import type { GeoSearchWidgetDescription } from '../connectors/geo-search/connectGeoSearch';
import type { HierarchicalMenuWidgetDescription } from '../connectors/hierarchical-menu/connectHierarchicalMenu';
import type { HitsPerPageWidgetDescription } from '../connectors/hits-per-page/connectHitsPerPage';
import type { InfiniteHitsWidgetDescription } from '../connectors/infinite-hits/connectInfiniteHits';
import type { MenuWidgetDescription } from '../connectors/menu/connectMenu';
import type { NumericMenuWidgetDescription } from '../connectors/numeric-menu/connectNumericMenu';
import type { PaginationWidgetDescription } from '../connectors/pagination/connectPagination';
import type { RangeWidgetDescription } from '../connectors/range/connectRange';
import type { RatingMenuWidgetDescription } from '../connectors/rating-menu/connectRatingMenu';
import type { RefinementListWidgetDescription } from '../connectors/refinement-list/connectRefinementList';
import type { RelevantSortWidgetDescription } from '../connectors/relevant-sort/connectRelevantSort';
import type { SearchBoxWidgetDescription } from '../connectors/search-box/connectSearchBox';
import type { SortByWidgetDescription } from '../connectors/sort-by/connectSortBy';
import type { ToggleRefinementWidgetDescription } from '../connectors/toggle-refinement/connectToggleRefinement';
import type { VoiceSearchWidgetDescription } from '../connectors/voice-search/connectVoiceSearch';
import type { PlacesWidgetDescription } from '../widgets/places/places';

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

type WidgetUiStates = PlacesWidgetDescription['indexUiState'];

export type IndexUiState = Partial<ConnectorUiStates & WidgetUiStates>;

export type UiState = {
  [indexId: string]: IndexUiState;
};
