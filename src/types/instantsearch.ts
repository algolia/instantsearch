export type InstantSearch = {
  templatesConfig?: object;
};

export type Helper = any;

export type HelperState = any;

export type SearchParameters = any;

export type SearchResults = any;

export type FacetRefinement = {
  value: string;
  type: string;
};

export type NumericRefinement = {
  value: number[];
  type: string;
  operator: string;
};

export type Refinement = FacetRefinement | NumericRefinement;
