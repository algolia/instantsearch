import { SearchParameters } from '../../types';
import findIndex from './findIndex';

type Merge = (value: SearchParameters) => SearchParameters;

type Merger = (right: SearchParameters) => Merge;

const compose = <TValue>(...fns: Array<(x: TValue) => TValue>) => (
  initial: TValue
) => fns.reduceRight((_, fn) => fn(_), initial);

const mergeWithRest: Merger = right => left => {
  const {
    facets,
    disjunctiveFacets,
    facetsRefinements,
    facetsExcludes,
    disjunctiveFacetsRefinements,
    numericRefinements,
    tagRefinements,
    hierarchicalFacets,
    hierarchicalFacetsRefinements,
    ...rest
  } = right;

  return left.setQueryParameters(rest);
};

// Merge facets
const mergeFacets: Merger = right => left =>
  right.facets!.reduce((_, name) => _.addFacet(name), left);

const mergeDisjunctiveFacets: Merger = right => left =>
  right.disjunctiveFacets!.reduce(
    (_, name) => _.addDisjunctiveFacet(name),
    left
  );

const mergeTagRefinements: Merger = right => left =>
  right.tagRefinements!.reduce((_, value) => _.addTagRefinement(value), left);

type HierarchicalFacet = {
  name: string;
  attributes: string[];
  separator: string;
};

const mergeHierarchicalFacets: Merger = right => left =>
  left.setQueryParameters({
    // @TODO: remove this cast when typings in helper are merged
    hierarchicalFacets: (right.hierarchicalFacets as HierarchicalFacet[]).reduce(
      (facets, facet) => {
        const index = findIndex(facets, _ => _.name === facet.name);

        if (index === -1) {
          return facets.concat(facet);
        }

        const nextFacets = facets.slice();
        nextFacets.splice(index, 1, facet);

        return nextFacets;
      },
      left.hierarchicalFacets as HierarchicalFacet[]
    ),
  });

// Merge facets refinements
const mergeFacetRefinements: Merger = right => left =>
  left.setQueryParameters({
    facetsRefinements: {
      ...left.facetsRefinements,
      ...right.facetsRefinements,
    },
  });

const mergeFacetsExcludes: Merger = right => left =>
  left.setQueryParameters({
    facetsExcludes: {
      ...left.facetsExcludes,
      ...right.facetsExcludes,
    },
  });

const mergeDisjunctiveFacetsRefinements: Merger = right => left =>
  left.setQueryParameters({
    disjunctiveFacetsRefinements: {
      ...left.disjunctiveFacetsRefinements,
      ...right.disjunctiveFacetsRefinements,
    },
  });

const mergeNumericRefinements: Merger = right => left =>
  left.setQueryParameters({
    numericRefinements: {
      ...left.numericRefinements,
      ...right.numericRefinements,
    },
  });

const mergeHierarchicalFacetsRefinements: Merger = right => left =>
  left.setQueryParameters({
    hierarchicalFacetsRefinements: {
      ...left.hierarchicalFacetsRefinements,
      ...right.hierarchicalFacetsRefinements,
    },
  });

const merge = (...parameters: SearchParameters[]): SearchParameters => {
  return parameters.reduce((left, right) =>
    compose(
      mergeHierarchicalFacetsRefinements(right),
      mergeHierarchicalFacets(right),
      mergeTagRefinements(right),
      mergeNumericRefinements(right),
      mergeDisjunctiveFacetsRefinements(right),
      mergeFacetsExcludes(right),
      mergeFacetRefinements(right),
      mergeDisjunctiveFacets(right),
      mergeFacets(right),
      mergeWithRest(right)
    )(left)
  );
};

export default merge;
