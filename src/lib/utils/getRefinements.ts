import { SearchParameters, SearchResults } from '../../types';
import find from './find';
import unescapeRefinement from './unescapeRefinement';

export interface FacetRefinement {
  type:
    | 'facet'
    | 'exclude'
    | 'disjunctive'
    | 'hierarchical'
    | 'numeric'
    | 'tag'
    | 'query';
  attributeName: string;
  name: string;
  count?: number;
  exhaustive?: boolean;
}

export interface QueryRefinement
  extends Pick<FacetRefinement, 'type' | 'attributeName' | 'name'> {
  type: 'query';
  query: string;
}

export interface NumericRefinement extends FacetRefinement {
  type: 'numeric';
  numericValue: number;
  operator: '<' | '<=' | '=' | '!=' | '>=' | '>';
}

export interface FacetExcludeRefinement extends FacetRefinement {
  type: 'exclude';
  exclude: boolean;
}

export type Refinement =
  | FacetRefinement
  | QueryRefinement
  | NumericRefinement
  | FacetExcludeRefinement;

function getRefinement(
  state: SearchParameters,
  type: Refinement['type'],
  attributeName: Refinement['attributeName'],
  name: Refinement['name'],
  resultsFacets: SearchResults['facets' | 'hierarchicalFacets'] = []
): Refinement {
  const res: Refinement = { type, attributeName, name };
  let facet: any = find(
    resultsFacets as Array<{ name: string }>,
    resultsFacet => resultsFacet.name === attributeName
  );
  let count: number;

  if (type === 'hierarchical') {
    const facetDeclaration = state.getHierarchicalFacetByName(attributeName);
    const nameParts = name.split(facetDeclaration.separator);

    const getFacetRefinement = (
      facetData: any
    ): ((refinementKey: string) => any) => (refinementKey: string): any =>
      facetData[refinementKey];

    for (let i = 0; facet !== undefined && i < nameParts.length; ++i) {
      facet =
        facet.data &&
        find(
          Object.keys(facet.data).map(getFacetRefinement(facet.data)),
          refinement => refinement.name === nameParts[i]
        );
    }

    count = facet && facet.count;
  } else {
    count = facet && facet.data && facet.data[res.name];
  }

  const exhaustive = facet && facet.exhaustive;

  if (count !== undefined) {
    res.count = count;
  }

  if (exhaustive !== undefined) {
    res.exhaustive = exhaustive;
  }

  return res;
}

function getRefinements(
  results: SearchResults,
  state: SearchParameters,
  clearsQuery: boolean = false
): Refinement[] {
  const res: Refinement[] = [];
  const {
    facetsRefinements = {},
    facetsExcludes = {},
    disjunctiveFacetsRefinements = {},
    hierarchicalFacetsRefinements = {},
    numericRefinements = {},
    tagRefinements = [],
  } = state;

  Object.keys(facetsRefinements).forEach(attributeName => {
    const refinements = facetsRefinements[attributeName];

    refinements.forEach(refinement => {
      res.push(
        getRefinement(state, 'facet', attributeName, refinement, results.facets)
      );
    });
  });

  Object.keys(facetsExcludes).forEach(attributeName => {
    const refinements = facetsExcludes[attributeName];

    refinements.forEach(refinement => {
      res.push({
        type: 'exclude',
        attributeName,
        name: refinement,
        exclude: true,
      });
    });
  });

  Object.keys(disjunctiveFacetsRefinements).forEach(attributeName => {
    const refinements = disjunctiveFacetsRefinements[attributeName];

    refinements.forEach(refinement => {
      res.push(
        getRefinement(
          state,
          'disjunctive',
          attributeName,
          // We unescape any disjunctive refined values with `unescapeRefinement` because
          // they can be escaped on negative numeric values with `escapeRefinement`.
          unescapeRefinement(refinement),
          results.disjunctiveFacets
        )
      );
    });
  });

  Object.keys(hierarchicalFacetsRefinements).forEach(attributeName => {
    const refinements = hierarchicalFacetsRefinements[attributeName];

    refinements.forEach(refinement => {
      res.push(
        getRefinement(
          state,
          'hierarchical',
          attributeName,
          refinement,
          results.hierarchicalFacets
        )
      );
    });
  });

  Object.keys(numericRefinements).forEach(attributeName => {
    const operators = numericRefinements[attributeName];

    Object.keys(operators).forEach(operator => {
      const valueOrValues = operators[operator];
      const refinements = Array.isArray(valueOrValues)
        ? valueOrValues
        : [valueOrValues];

      refinements.forEach(refinement => {
        res.push({
          type: 'numeric',
          attributeName,
          name: `${refinement}`,
          numericValue: refinement,
          operator,
        });
      });
    });
  });

  tagRefinements.forEach(refinement => {
    res.push({ type: 'tag', attributeName: '_tags', name: refinement });
  });

  if (clearsQuery && state.query && state.query.trim()) {
    res.push({
      attributeName: 'query',
      type: 'query',
      name: state.query || '',
      query: state.query || '',
    });
  }

  return res;
}

export default getRefinements;
