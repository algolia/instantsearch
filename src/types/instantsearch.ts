import { SearchParameters } from 'algoliasearch-helper';
import { Client as AlgoliaSearchClient } from 'algoliasearch';
import { UiState } from './widget';
export {
  default as InstantSearch,
  InstantSearchOptions,
} from '../lib/InstantSearch';

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

export interface AlgoliaHit {
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
}

export interface Hit extends AlgoliaHit {
  __position: number;
  __queryID?: string;
}

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

/**
 * The router is the part that saves and reads the object from the storage.
 * Usually this is the URL.
 */
export interface Router<TRouteState = UiState> {
  /**
   * onUpdate Sets an event listener that is triggered when the storage is updated.
   * The function should accept a callback to trigger when the update happens.
   * In the case of the history / URL in a browser, the callback will be called
   * by `onPopState`.
   */
  onUpdate(callback: (route: TRouteState) => void): void;

  /**
   * Reads the storage and gets a route object. It does not take parameters,
   * and should return an object
   */
  read(): TRouteState;

  /**
   * Pushes a route object into a storage. Takes the UI state mapped by the state
   * mapping configured in the mapping
   */
  write(route: TRouteState): void;

  /**
   * Transforms a route object into a URL. It receives an object and should
   * return a string. It may return an empty string.
   */
  createURL(state: TRouteState): string;

  /**
   * Called when InstantSearch is disposed. Used to remove subscriptions.
   */
  dispose(): void;
}

/**
 * The state mapping is a way to customize the structure before sending it to the router.
 * It can transform and filter out the properties. To work correctly, the following
 * should be valid for any UiState:
 * `UiState = routeToState(stateToRoute(UiState))`.
 */
export type StateMapping<TRouteState = UiState> = {
  /**
   * Transforms a UI state representation into a route object.
   * It receives an object that contains the UI state of all the widgets in the page.
   * It should return an object of any form as long as this form can be read by
   * the `routeToState` function.
   */
  stateToRoute(uiState: UiState): TRouteState;
  /**
   * Transforms route object into a UI state representation.
   * It receives an object that contains the UI state stored by the router.
   * The format is the output of `stateToRoute`.
   */
  routeToState(routeState: TRouteState): UiState;
};

// @TODO: use the generic form of this in routers
export type RouteState = {
  [stateKey: string]: any;
};

export type SearchClient = Pick<
  AlgoliaSearchClient,
  'search' | 'searchForFacetValues'
>;
