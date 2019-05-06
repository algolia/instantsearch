import { Client as AlgoliaSearchClient } from 'algoliasearch';
import { InsightsClient as AlgoliaInsightsClient } from './insights';
import {
  AlgoliaSearchHelper,
  SearchParameters as AlgoliaSearchHelperSearchParameters,
  SearchResults as AlgoliaSearchHelperSearchResults,
} from 'algoliasearch-helper';
import { Widget, UiState } from './widget';

export type InstantSearchOptions = any;

// That's a proxy to avoid manipulating the original `algoliasearch-helper` SearchParameters
// typings and to add newer search parameters not yet documented.
export type SearchParameters = AlgoliaSearchHelperSearchParameters & {
  ruleContexts?: string[];
};

export type SearchResults = AlgoliaSearchHelperSearchResults;

type HitAttributeHighlightResult = {
  value: string;
  matchLevel: 'none' | 'partial' | 'full';
  matchedWords: string[];
  fullyHighlighted?: boolean;
};

type HitHighlightResult = {
  [attribute: string]:
    | HitAttributeHighlightResult
    | HitAttributeHighlightResult[]
    | HitHighlightResult;
};

type HitAttributeSnippetResult = Pick<
  HitAttributeHighlightResult,
  'value' | 'matchLevel'
>;

type HitSnippetResult = {
  [attribute: string]:
    | HitAttributeSnippetResult
    | HitAttributeSnippetResult[]
    | HitSnippetResult;
};

export type Hit = {
  [attribute: string]: any;
  objectID: string;
  _highlightResult?: HitHighlightResult;
  _snippetResult?: HitSnippetResult;
  _rankingInfo?: {
    promoted: boolean;
    nbTypos: number;
    firstMatchedWord: number;
    proximityDistance?: number;
    geoDistance: number;
    geoPrecision?: number;
    nbExactWords: number;
    words: number;
    filters: number;
    userScore: number;
    matchedGeoLocation?: {
      lat: number;
      lng: number;
      distance: number;
    };
  };
  _distinctSeqID?: number;
  __position: number;
  __queryID?: string;
};

export type Hits = Hit[];

export type FacetHit = {
  value: string;
  highlighted: string;
  count: number;
  isRefined: boolean;
};

export type FacetRefinement = {
  value: string;
  type: 'conjunctive' | 'disjunctive' | 'exclude';
};

export type NumericRefinement = {
  value: number[];
  type: 'numeric';
  operator: string;
};

export type Refinement = FacetRefinement | NumericRefinement;

export type Router<TRouteState = UiState> = {
  onUpdate(callback: (route: TRouteState) => void): void;
  read(): UiState;
  write(route: TRouteState): void;
  createURL(state: TRouteState): string;
  dispose(): Widget['dispose'];
};

export type StateMapping<TRouteState = UiState> = {
  stateToRoute(state: UiState): TRouteState;
  routeToState(route: TRouteState): UiState;
};

export type Client = AlgoliaSearchClient;

export type Helper = AlgoliaSearchHelper;

export type InstantSearch = {
  templatesConfig?: object;
  insightsClient?: AlgoliaInsightsClient;
  helper: Helper | null;
  widgets: Widget[];
};

export type RouteState = {
  [stateKey: string]: any;
};
