import find from 'lodash/find';
import get from 'lodash/get';
import forEach from 'lodash/forEach';
import { HelperState, SearchResults } from '../../types';
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
  operator: '<' | '<=' | '=' | '>=' | '>';
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
  state: HelperState,
  type: Refinement['type'],
  attributeName: Refinement['attributeName'],
  name: Refinement['name'],
  resultsFacets: string[]
): Refinement {
  const res: Refinement = { type, attributeName, name };
  let facet: any = find(resultsFacets, { name: attributeName });
  let count: number;

  if (type === 'hierarchical') {
    const facetDeclaration = state.getHierarchicalFacetByName(attributeName);
    const split = name.split(facetDeclaration.separator);

    for (let i = 0; facet !== undefined && i < split.length; ++i) {
      facet = find(facet.data, { name: split[i] });
    }

    count = get(facet, 'count');
  } else {
    count = get(facet, `data["${res.name}"]`);
  }

  const exhaustive = get(facet, 'exhaustive');

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
  state: HelperState,
  clearsQuery: boolean = false
): Refinement[] {
  const res: Refinement[] = [];

  forEach(state.facetsRefinements, (refinements, attributeName) => {
    forEach(refinements, name => {
      res.push(
        getRefinement(state, 'facet', attributeName, name, results.facets)
      );
    });
  });

  forEach(state.facetsExcludes, (refinements, attributeName) => {
    forEach(refinements, name => {
      res.push({ type: 'exclude', attributeName, name, exclude: true });
    });
  });

  forEach(state.disjunctiveFacetsRefinements, (refinements, attributeName) => {
    forEach(refinements, name => {
      res.push(
        getRefinement(
          state,
          'disjunctive',
          attributeName,
          // we unescapeRefinement any disjunctive refined value since they can be escaped
          // when negative numeric values search `escapeRefinement` usage in code
          unescapeRefinement(name),
          results.disjunctiveFacets
        )
      );
    });
  });

  forEach(state.hierarchicalFacetsRefinements, (refinements, attributeName) => {
    forEach(refinements, name => {
      res.push(
        getRefinement(
          state,
          'hierarchical',
          attributeName,
          name,
          results.hierarchicalFacets
        )
      );
    });
  });

  forEach(state.numericRefinements, (operators, attributeName) => {
    forEach(operators, (values, operator) => {
      forEach(values, value => {
        res.push({
          type: 'numeric',
          attributeName,
          name: `${value}`,
          numericValue: value,
          operator,
        });
      });
    });
  });

  forEach(state.tagRefinements, name => {
    res.push({ type: 'tag', attributeName: '_tags', name });
  });

  if (clearsQuery && state.query && state.query.trim()) {
    res.push({
      attributeName: 'query',
      type: 'query',
      name: state.query,
      query: state.query,
    });
  }

  return res;
}

export default getRefinements;
