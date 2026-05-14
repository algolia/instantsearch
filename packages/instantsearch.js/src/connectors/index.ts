import { connectDynamicWidgets } from 'instantsearch-core';

import { deprecate } from '../lib/utils';

import connectAnswers from './answers/connectAnswers';
import connectConfigureRelatedItems from './configure-related-items/connectConfigureRelatedItems';

/** @deprecated answers is no longer supported */
export const EXPERIMENTAL_connectAnswers = deprecate(
  connectAnswers,
  'answers is no longer supported'
);

/** @deprecated use connectRelatedItems instead */
export const EXPERIMENTAL_connectConfigureRelatedItems = deprecate(
  connectConfigureRelatedItems,
  'EXPERIMENTAL_connectConfigureRelatedItems is deprecated and will be removed in a next minor version of InstantSearch. Please use connectRelatedItems instead.'
);

/** @deprecated use connectDynamicWidgets */
export const EXPERIMENTAL_connectDynamicWidgets = deprecate(
  connectDynamicWidgets,
  'use connectDynamicWidgets'
);

export { connectAutocomplete } from 'instantsearch-core';
export { connectBreadcrumb } from 'instantsearch-core';
export { connectChat } from 'instantsearch-core';
export { connectClearRefinements } from 'instantsearch-core';
export { connectConfigure } from 'instantsearch-core';
export { connectCurrentRefinements } from 'instantsearch-core';
export { connectDynamicWidgets } from 'instantsearch-core';
export { connectFeeds } from 'instantsearch-core';
export { connectFilterSuggestions } from 'instantsearch-core';
export { connectFrequentlyBoughtTogether } from 'instantsearch-core';
export { connectGeoSearch } from 'instantsearch-core';
export { connectHierarchicalMenu } from 'instantsearch-core';
export { connectHits } from 'instantsearch-core';
export { connectHitsWithInsights } from 'instantsearch-core';
export { connectHitsPerPage } from 'instantsearch-core';
export { connectInfiniteHits } from 'instantsearch-core';
export { connectInfiniteHitsWithInsights } from 'instantsearch-core';
export { connectLookingSimilar } from 'instantsearch-core';
export { connectMenu } from 'instantsearch-core';
export { connectNumericMenu } from 'instantsearch-core';
export { connectPagination } from 'instantsearch-core';
export { connectPoweredBy } from 'instantsearch-core';
export { connectQueryRules } from 'instantsearch-core';
export { connectRange } from 'instantsearch-core';
export { connectRatingMenu } from 'instantsearch-core';
export { connectRefinementList } from 'instantsearch-core';
export { connectRelatedProducts } from 'instantsearch-core';
export { connectRelevantSort } from 'instantsearch-core';
export { connectSearchBox } from 'instantsearch-core';
export { connectSortBy } from 'instantsearch-core';
export { connectStats } from 'instantsearch-core';
export { connectToggleRefinement } from 'instantsearch-core';
export { connectTrendingFacets } from 'instantsearch-core';
export { connectTrendingItems } from 'instantsearch-core';
export { connectVoiceSearch } from 'instantsearch-core';
export { createFeedContainer } from 'instantsearch-core';
export type {
  ApplyFiltersParams,
  AutocompleteConnector,
  AutocompleteConnectorParams,
  AutocompleteRenderState,
  AutocompleteWidgetDescription,
  BreadcrumbConnector,
  BreadcrumbConnectorParams,
  BreadcrumbConnectorParamsItem
} from 'instantsearch-core';
export type {
  BreadcrumbRenderState,
  BreadcrumbWidgetDescription,
  ChatConnector,
  ChatConnectorParams,
  ChatInit,
  ChatInitWithoutTransport,
  ChatRenderState,
  ChatTransport
} from 'instantsearch-core';
export type {
  ChatWidgetDescription,
  ClearRefinementsConnector,
  ClearRefinementsConnectorParams,
  ClearRefinementsRenderState,
  ClearRefinementsWidgetDescription,
  ConfigureConnector,
  ConfigureConnectorParams,
  ConfigureRenderState
} from 'instantsearch-core';
export type {
  ConfigureWidgetDescription,
  CurrentRefinementsConnector,
  CurrentRefinementsConnectorParams,
  CurrentRefinementsConnectorParamsItem,
  CurrentRefinementsConnectorParamsRefinement,
  CurrentRefinementsRenderState,
  CurrentRefinementsWidgetDescription,
  DynamicWidgetsConnector
} from 'instantsearch-core';
export type {
  DynamicWidgetsConnectorParams,
  DynamicWidgetsRenderState,
  DynamicWidgetsWidgetDescription,
  FeedsConnector,
  FeedsConnectorParams,
  FeedsRenderState,
  FeedsWidgetDescription,
  FilterSuggestionsConnector
} from 'instantsearch-core';
export type {
  FilterSuggestionsConnectorParams,
  FilterSuggestionsRenderState,
  FilterSuggestionsTransport,
  FilterSuggestionsWidgetDescription,
  FrequentlyBoughtTogetherConnector,
  FrequentlyBoughtTogetherConnectorParams,
  FrequentlyBoughtTogetherRenderState,
  FrequentlyBoughtTogetherWidgetDescription
} from 'instantsearch-core';
export type {
  GeoHit,
  GeoSearchConnector,
  GeoSearchConnectorParams,
  GeoSearchRenderState,
  GeoSearchWidgetDescription,
  HierarchicalMenuConnector,
  HierarchicalMenuConnectorParams,
  HierarchicalMenuItem
} from 'instantsearch-core';
export type {
  HierarchicalMenuRenderState,
  HierarchicalMenuWidgetDescription,
  HitsConnector,
  HitsConnectorParams,
  HitsPerPageConnector,
  HitsPerPageConnectorParams,
  HitsPerPageConnectorParamsItem,
  HitsPerPageRenderState
} from 'instantsearch-core';
export type {
  HitsPerPageRenderStateItem,
  HitsPerPageWidgetDescription,
  HitsRenderState,
  HitsWidgetDescription,
  InfiniteHitsCache,
  InfiniteHitsCachedHits,
  InfiniteHitsConnector,
  InfiniteHitsConnectorParams
} from 'instantsearch-core';
export type {
  InfiniteHitsRenderState,
  InfiniteHitsWidgetDescription,
  LookingSimilarConnector,
  LookingSimilarConnectorParams,
  LookingSimilarRenderState,
  LookingSimilarWidgetDescription,
  MenuConnector,
  MenuConnectorParams
} from 'instantsearch-core';
export type {
  MenuItem,
  MenuRenderState,
  MenuWidgetDescription,
  NumericMenuConnector,
  NumericMenuConnectorParams,
  NumericMenuConnectorParamsItem,
  NumericMenuRenderState,
  NumericMenuRenderStateItem
} from 'instantsearch-core';
export type {
  NumericMenuWidgetDescription,
  PaginationConnector,
  PaginationConnectorParams,
  PaginationRenderState,
  PaginationWidgetDescription,
  ParamTrackedFilters,
  ParamTransformRuleContexts,
  PoweredByConnector
} from 'instantsearch-core';
export type {
  PoweredByConnectorParams,
  PoweredByRenderState,
  PoweredByWidgetDescription,
  QueryRulesConnector,
  QueryRulesConnectorParams,
  QueryRulesRenderState,
  QueryRulesWidgetDescription,
  Range
} from 'instantsearch-core';
export type {
  RangeBoundaries,
  RangeConnector,
  RangeConnectorParams,
  RangeMax,
  RangeMin,
  RangeRenderState,
  RangeWidgetDescription,
  RatingMenuConnector
} from 'instantsearch-core';
export type {
  RatingMenuConnectorParams,
  RatingMenuRenderState,
  RatingMenuWidgetDescription,
  RefinementListConnector,
  RefinementListConnectorParams,
  RefinementListItem,
  RefinementListRenderState,
  RefinementListWidgetDescription
} from 'instantsearch-core';
export type {
  RelatedProductsConnector,
  RelatedProductsConnectorParams,
  RelatedProductsRenderState,
  RelatedProductsWidgetDescription,
  RelevantSortConnector,
  RelevantSortConnectorParams,
  RelevantSortRenderState,
  RelevantSortWidgetDescription
} from 'instantsearch-core';
export type {
  SearchBoxConnector,
  SearchBoxConnectorParams,
  SearchBoxRenderState,
  SearchBoxWidgetDescription,
  SendEventForToggle,
  SortByConnector,
  SortByConnectorParams,
  SortByIndexItem
} from 'instantsearch-core';
export type {
  SortByItem,
  SortByRenderState,
  SortByStrategyItem,
  SortByWidgetDescription,
  StatsConnector,
  StatsConnectorParams,
  StatsRenderState,
  StatsWidgetDescription
} from 'instantsearch-core';
export type {
  Suggestion,
  ToggleRefinementConnector,
  ToggleRefinementConnectorParams,
  ToggleRefinementRenderState,
  ToggleRefinementValue,
  ToggleRefinementWidgetDescription,
  TransformItemsIndicesConfig,
  TrendingFacetsConnector
} from 'instantsearch-core';
export type {
  TrendingFacetsConnectorParams,
  TrendingFacetsRenderState,
  TrendingFacetsWidgetDescription,
  TrendingItemsConnector,
  TrendingItemsConnectorParams,
  TrendingItemsRenderState,
  TrendingItemsWidgetDescription,
  VoiceSearchConnector
} from 'instantsearch-core';
export type {
  VoiceSearchConnectorParams,
  VoiceSearchRenderState,
  VoiceSearchWidgetDescription
} from 'instantsearch-core';
