import { Client as AlgoliaSearchClient } from 'algoliasearch';
import { AlgoliaSearchHelper, SearchParameters } from 'algoliasearch-helper';
import { Index } from '../widgets/index/index';
import { InsightsClient as AlgoliaInsightsClient } from './insights';
import { Widget, UiState } from './widget';

export type InstantSearchOptions = any;

// @TODO: can this be written some other way?
export type HelperChangeEvent = {
  state: SearchParameters;
};

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

export interface Router<TRouteState = UiState> extends Widget {
  onUpdate(callback: (route: TRouteState) => void): void;
  read(): UiState;
  write(route: TRouteState): void;
  createURL(state: TRouteState): string;
}

export type StateMapping<TRouteState = UiState> = {
  stateToRoute(state: UiState): TRouteState;
  routeToState(route: TRouteState): UiState;
};

export type Client = AlgoliaSearchClient;

export type InstantSearch = {
  helper: AlgoliaSearchHelper | null;
  mainHelper: AlgoliaSearchHelper | null;
  mainIndex: Index;
  insightsClient: AlgoliaInsightsClient | null;
  templatesConfig: object;
  _isSearchStalled: boolean;
  _searchParameters: Partial<SearchParameters>;
  _createAbsoluteURL(state: Partial<SearchParameters>): string;
  scheduleSearch(): void;
  scheduleRender(): void;
  scheduleStalledRender(): void;
};

export type RouteState = {
  [stateKey: string]: any;
};
