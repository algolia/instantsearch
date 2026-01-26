import { flat } from './flat';

import type { AlgoliaSearchHelper } from 'algoliasearch-helper';
import type { ApplyFiltersParams } from 'instantsearch-ui-components';

export function updateStateFromSearchToolInput(
  params: ApplyFiltersParams,
  helper: AlgoliaSearchHelper
) {
  if (params.query) {
    helper.setQuery(params.query);
  }

  if (params.facetFilters) {
    const attributes = flat(params.facetFilters).map((filter) => {
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
