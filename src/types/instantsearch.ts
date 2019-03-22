export type InstantSearch = {
  templatesConfig?: object;
};

export type Helper = any;

export type HelperState = any;

export type SearchParameters = any;

export type SearchResults = any;

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
