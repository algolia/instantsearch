export type HitAttributeHighlightResult = {
  value: string;
  matchLevel: 'none' | 'partial' | 'full';
  matchedWords: string[];
  fullyHighlighted?: boolean;
};

export type HitHighlightResult = {
  [attribute: string]:
    | HitAttributeHighlightResult
    | HitAttributeHighlightResult[]
    | HitHighlightResult[]
    | HitHighlightResult;
};

export type HitAttributeSnippetResult = Pick<
  HitAttributeHighlightResult,
  'value' | 'matchLevel'
>;

export type HitSnippetResult = {
  [attribute: string]:
    | HitAttributeSnippetResult[]
    | HitSnippetResult[]
    | HitAttributeSnippetResult
    | HitSnippetResult;
};

export type GeoLoc = {
  lat: number;
  lng: number;
};

export type AlgoliaHit = {
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
  _geoLoc?: GeoLoc;
};

export type Hit = {
  __position: number;
  __queryID?: string;
} & AlgoliaHit;

export type Hits = Hit[];

export type EscapedHits<THit = Hit> = THit[] & { __escaped: boolean };

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
