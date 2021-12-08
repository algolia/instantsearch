import type { AutocompleteWidgetDescription } from '../connectors/autocomplete/connectAutocomplete.js';
import type { ConfigureWidgetDescription } from '../connectors/configure/connectConfigure.js';
import type { GeoSearchWidgetDescription } from '../connectors/geo-search/connectGeoSearch.js';
import type { HierarchicalMenuWidgetDescription } from '../connectors/hierarchical-menu/connectHierarchicalMenu.js';
import type { HitsPerPageWidgetDescription } from '../connectors/hits-per-page/connectHitsPerPage.js';
import type { InfiniteHitsWidgetDescription } from '../connectors/infinite-hits/connectInfiniteHits.js';
import type { MenuWidgetDescription } from '../connectors/menu/connectMenu.js';
import type { NumericMenuWidgetDescription } from '../connectors/numeric-menu/connectNumericMenu.js';
import type { PaginationWidgetDescription } from '../connectors/pagination/connectPagination.js';
import type { RangeWidgetDescription } from '../connectors/range/connectRange.js';
import type { RatingMenuWidgetDescription } from '../connectors/rating-menu/connectRatingMenu.js';
import type { RefinementListWidgetDescription } from '../connectors/refinement-list/connectRefinementList.js';
import type { RelevantSortWidgetDescription } from '../connectors/relevant-sort/connectRelevantSort.js';
import type { SearchBoxWidgetDescription } from '../connectors/search-box/connectSearchBox.js';
import type { SortByWidgetDescription } from '../connectors/sort-by/connectSortBy.js';
import type { ToggleRefinementWidgetDescription } from '../connectors/toggle-refinement/connectToggleRefinement.js';
import type { VoiceSearchWidgetDescription } from '../connectors/voice-search/connectVoiceSearch.js';
import type { PlacesWidgetDescription } from '../widgets/places/places.js';

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
