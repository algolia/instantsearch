import { SearchParameters } from 'algoliasearch-helper';

export function mergeSearchParameters(
  ...args: SearchParameters[]
): SearchParameters {
  return args.reduce(minimalMerge, new SearchParameters());
}

type ValueTypes<T> = T extends Array<infer U> ? U : never;

type MergeMap = {
  [key in ValueTypes<SearchParameters['managedParameters']>]: (
    searchParameters: SearchParameters,
    newValue: SearchParameters[key]
  ) => SearchParameters
};
const mergeMap: MergeMap = {
  disjunctiveFacets(searchParameters, newValue) {
    if (!newValue) {
      return searchParameters;
    }
    return newValue.reduce(
      (acc, curr) => acc.addDisjunctiveFacet(curr),
      searchParameters
    );
  },
  disjunctiveFacetsRefinements(searchParameters, newValue) {
    if (!newValue) {
      return searchParameters;
    }
    return Object.keys(newValue).reduce((acc, facet) => {
      if (!newValue[facet]) {
        return acc;
      }
      return newValue[facet].reduce(
        (acc, value) => acc.addDisjunctiveFacetRefinement(facet, value),
        acc
      );
    }, searchParameters);
  },
  hierarchicalFacets(searchParameters, newValue) {
    if (!newValue) {
      return searchParameters;
    }
    // lol idk why typescript complains here
    return newValue.reduce((acc: SearchParameters, hierarchicalFacet) => {
      // TODO: findIndex polyfill
      const existingIndex = acc.hierarchicalFacets.findIndex(
        item => item.name === hierarchicalFacet.name
      );
      if (acc.isHierarchicalFacet(hierarchicalFacet.name)) {
        return acc.setQueryParameters({
          hierarchicalFacets: acc.hierarchicalFacets.splice(
            existingIndex,
            1,
            hierarchicalFacet
          ),
        });
      }

      return acc.setQueryParameters({
        hierarchicalFacets: acc.hierarchicalFacets.concat([hierarchicalFacet]),
      });
    }, searchParameters);
  },
  // not necessary
  index(searchParameters, newValue) {
    searchParameters.index = newValue;
    return searchParameters;
  },
  facets(searchParameters, newValue) {
    if (!newValue) {
      return searchParameters;
    }
    return newValue.reduce((acc, curr) => acc.addFacet(curr), searchParameters);
  },
  facetsRefinements(searchParameters, newValue) {
    if (!newValue) {
      return searchParameters;
    }
    return Object.keys(newValue).reduce((acc, facet) => {
      if (!newValue[facet]) {
        return acc;
      }
      return newValue[facet].reduce(
        (acc, value) => acc.addFacetRefinement(facet, value),
        acc
      );
    }, searchParameters);
  },
  facetsExcludes(searchParameters, newValue) {
    if (!newValue) {
      return searchParameters;
    }
    return Object.keys(newValue).reduce((acc, facet) => {
      if (!newValue[facet]) {
        return acc;
      }
      return newValue[facet].reduce(
        // lol what a horrible name!
        (acc, value) => acc.addExcludeRefinement(facet, value),
        acc
      );
    }, searchParameters);
  },
  // todo: not correct yet :o
  numericRefinements(searchParameters, newValue) {
    if (!newValue) {
      return searchParameters;
    }
    return Object.keys(newValue).reduce((acc, facet) => {
      if (!newValue[facet]) {
        return acc;
      }

      return Object.keys(newValue[facet]).reduce((acc, operator) => {
        const value = newValue[facet][operator];
        return acc.addNumericRefinement(
          facet,
          // Object.keys loses type of object :(
          operator as any,
          value
        );
      }, acc);
    }, searchParameters);
  },
  tagRefinements(searchParameters, newValue) {
    if (!newValue) {
      return searchParameters;
    }

    return newValue.reduce(
      (acc, curr) => acc.addTagRefinement(curr),
      searchParameters
    );
  },
  hierarchicalFacetsRefinements(searchParameters, newValue) {
    if (!newValue) {
      return searchParameters;
    }
    return Object.keys(newValue).reduce(
      (acc, facet) =>
        acc.addHierarchicalFacetRefinement(
          facet,
          newValue[facet].join(
            acc._getHierarchicalFacetSeparator(
              acc.getHierarchicalFacetByName(facet)
            )
          )
        ),
      searchParameters
    );
  },
};

function minimalMerge(
  a: SearchParameters,
  b: SearchParameters
): SearchParameters {
  // ehhh, I don't like this, but https://github.com/microsoft/TypeScript/pull/12253
  const keys = Object.keys(b) as (keyof SearchParameters)[];
  return new SearchParameters(
    keys.reduce((acc, key) => {
      // other option: typeof mergeMap[key] === 'function'
      if (key in mergeMap) {
        // implicit any here still?
        return mergeMap[key](acc, b[key]);
      }
      if (key in b) {
        acc[key] = b[key];
      }
      return acc;
    }, a)
  );
}
