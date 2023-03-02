import { unescapeFacetValue, escapeFacetValue } from './escapeFacetValue';
import { find } from './find';

import type { SearchParameters, SearchResults } from 'algoliasearch-helper';

export type FacetRefinement = {
  type: 'facet' | 'disjunctive' | 'hierarchical';
  attribute: string;
  name: string;
  escapedValue: string;
  count?: number;
  exhaustive?: boolean;
};

export type TagRefinement = {
  type: 'tag';
  attribute: string;
  name: string;
};

export type QueryRefinement = {
  type: 'query';
  attribute: 'query';
  query: string;
  name: string;
};

export type NumericRefinement = {
  type: 'numeric';
  numericValue: number;
  operator: '<' | '<=' | '=' | '!=' | '>=' | '>';
  attribute: string;
  name: string;
  count?: number;
  exhaustive?: boolean;
};

export type FacetExcludeRefinement = {
  type: 'exclude';
  exclude: boolean;
  attribute: string;
  name: string;
  count?: number;
  exhaustive?: boolean;
};

export type Refinement =
  | FacetRefinement
  | QueryRefinement
  | NumericRefinement
  | FacetExcludeRefinement
  | TagRefinement;

function getRefinement(
  state: SearchParameters,
  type: FacetRefinement['type'],
  attribute: FacetRefinement['attribute'],
  name: FacetRefinement['name'],
  resultsFacets: SearchResults['facets' | 'hierarchicalFacets'] = []
): FacetRefinement {
  const res: FacetRefinement = {
    type,
    attribute,
    name,
    escapedValue: escapeFacetValue(name),
  };
  let facet: any = find(
    resultsFacets,
    (resultsFacet) => resultsFacet.name === attribute
  );
  let count: number;

  if (type === 'hierarchical') {
    const facetDeclaration = state.getHierarchicalFacetByName(attribute);
    const nameParts = name.split(facetDeclaration.separator);

    const getFacetRefinement =
      (facetData: any): ((refinementKey: string) => any) =>
      (refinementKey: string): any =>
        facetData[refinementKey];

    for (let i = 0; facet !== undefined && i < nameParts.length; ++i) {
      facet =
        facet &&
        facet.data &&
        find(
          Object.keys(facet.data).map(getFacetRefinement(facet.data)),
          (refinement) => refinement.name === nameParts[i]
        );
    }

    count = facet && facet.count;
  } else {
    count = facet && facet.data && facet.data[res.name];
  }

  if (count !== undefined) {
    res.count = count;
  }

  if (facet && facet.exhaustive !== undefined) {
    res.exhaustive = facet.exhaustive;
  }

  return res;
}

export function getRefinements(
  results: SearchResults | Record<string, never>,
  state: SearchParameters,
  includesQuery: boolean = false
): Refinement[] {
  const refinements: Refinement[] = [];
  const {
    facetsRefinements = {},
    facetsExcludes = {},
    disjunctiveFacetsRefinements = {},
    hierarchicalFacetsRefinements = {},
    numericRefinements = {},
    tagRefinements = [],
  } = state;

  Object.keys(facetsRefinements).forEach((attribute) => {
    const refinementNames = facetsRefinements[attribute];

    refinementNames.forEach((refinementName) => {
      refinements.push(
        getRefinement(state, 'facet', attribute, refinementName, results.facets)
      );
    });
  });

  Object.keys(facetsExcludes).forEach((attribute) => {
    const refinementNames = facetsExcludes[attribute];

    refinementNames.forEach((refinementName) => {
      refinements.push({
        type: 'exclude',
        attribute,
        name: refinementName,
        exclude: true,
      });
    });
  });

  Object.keys(disjunctiveFacetsRefinements).forEach((attribute) => {
    const refinementNames = disjunctiveFacetsRefinements[attribute];

    refinementNames.forEach((refinementName) => {
      refinements.push(
        getRefinement(
          state,
          'disjunctive',
          attribute,
          // We unescape any disjunctive refined values with `unescapeFacetValue` because
          // they can be escaped on negative numeric values with `escapeFacetValue`.
          unescapeFacetValue(refinementName),
          results.disjunctiveFacets
        )
      );
    });
  });

  Object.keys(hierarchicalFacetsRefinements).forEach((attribute) => {
    const refinementNames = hierarchicalFacetsRefinements[attribute];

    refinementNames.forEach((refinement) => {
      refinements.push(
        getRefinement(
          state,
          'hierarchical',
          attribute,
          refinement,
          results.hierarchicalFacets
        )
      );
    });
  });

  Object.keys(numericRefinements).forEach((attribute) => {
    const operators = numericRefinements[attribute];

    Object.keys(operators).forEach((operatorOriginal) => {
      const operator = operatorOriginal as SearchParameters.Operator;
      const valueOrValues = operators[operator];
      const refinementNames = Array.isArray(valueOrValues)
        ? valueOrValues
        : [valueOrValues];

      refinementNames.forEach((refinementName: any) => {
        refinements.push({
          type: 'numeric',
          attribute,
          name: `${refinementName}`,
          numericValue: refinementName,
          operator: operator as NumericRefinement['operator'],
        });
      });
    });
  });

  tagRefinements.forEach((refinementName) => {
    refinements.push({ type: 'tag', attribute: '_tags', name: refinementName });
  });

  if (includesQuery && state.query && state.query.trim()) {
    refinements.push({
      attribute: 'query',
      type: 'query',
      name: state.query,
      query: state.query,
    });
  }

  return refinements;
}
