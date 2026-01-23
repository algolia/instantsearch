import type { AlgoliaSearchHelper } from 'algoliasearch-helper';

type SearchToolInput = {
  query: string;
  number_of_results?: number;
  facet_filters?: string[][];
};

export function updateStateFromSearchToolInput(
  input: SearchToolInput,
  helper: AlgoliaSearchHelper
) {
  if (input.query) {
    helper.setQuery(input.query);
  }

  if (input.facet_filters) {
    const attributes = input.facet_filters.flat().map((filter) => {
      const [attribute, value] = filter.split(':');

      return { attribute, value };
    });

    if (
      attributes.some(
        ({ attribute }) =>
          !helper.state.isConjunctiveFacet(attribute) &&
          !helper.state.isHierarchicalFacet(attribute) &&
          !helper.state.isDisjunctiveFacet(attribute)
      )
    ) {
      return false;
    }

    attributes.forEach(({ attribute }) => {
      helper.clearRefinements(attribute);
    });

    attributes.forEach(({ attribute, value }) => {
      const hierarchicalFacet = helper.state.hierarchicalFacets.find(
        (facet) => facet.name === attribute
      );

      if (hierarchicalFacet) {
        helper.toggleFacetRefinement(hierarchicalFacet.name, value);
      } else {
        helper.toggleFacetRefinement(attribute, value);
      }
    });
  }

  helper.search();

  return true;
}
