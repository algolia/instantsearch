import { AutocompleteWidgetDescription } from '../connectors/autocomplete/connectAutocomplete';
import { ConfigureWidgetDescription } from '../connectors/configure/connectConfigure';
import { GeoSearchWidgetDescription } from '../connectors/geo-search/types';
import { HierarchicalMenuWidgetDescription } from '../connectors/hierarchical-menu/connectHierarchicalMenu';
import { HitsPerPageWidgetDescription } from '../connectors/hits-per-page/connectHitsPerPage';
import { InfiniteHitsWidgetDescription } from '../connectors/infinite-hits/connectInfiniteHits';
import { MenuWidgetDescription } from '../connectors/menu/connectMenu';
import { NumericMenuWidgetDescription } from '../connectors/numeric-menu/connectNumericMenu';
import { PaginationWidgetDescription } from '../connectors/pagination/connectPagination';
import { RangeWidgetDescription } from '../connectors/range/connectRange';
import { RatingMenuWidgetDescription } from '../connectors/rating-menu/connectRatingMenu';
import { RefinementListWidgetDescription } from '../connectors/refinement-list/connectRefinementList';
import { RelevantSortWidgetDescription } from '../connectors/relevant-sort/connectRelevantSort';
import { SearchBoxWidgetDescription } from '../connectors/search-box/connectSearchBox';
import { SortByWidgetDescription } from '../connectors/sort-by/connectSortBy';
import { ToggleRefinementWidgetDescription } from '../connectors/toggle-refinement/connectToggleRefinement';
import { VoiceSearchWidgetDescription } from '../connectors/voice-search/connectVoiceSearch';
import { PlacesWidgetDescription } from '../widgets/places/places';

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
