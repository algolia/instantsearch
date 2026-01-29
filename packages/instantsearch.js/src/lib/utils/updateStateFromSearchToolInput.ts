import { flat } from './flat';

import type { AlgoliaSearchHelper } from 'algoliasearch-helper';
import type { ApplyFiltersParams } from 'instantsearch-ui-components';

export function updateStateFromSearchToolInput(
  params: ApplyFiltersParams,
  helper: AlgoliaSearchHelper
) {
  if (params.facetFilters) {
    const attributes = flat(params.facetFilters).map((filter) => {
      const [attribute, value] = filter.split(':');

      return { attribute, value };
    });

    attributes.forEach(({ attribute }) => {
      helper.clearRefinements(attribute);
    });

    attributes.forEach(({ attribute, value }) => {
      if (
        !helper.state.isConjunctiveFacet(attribute) &&
        !helper.state.isHierarchicalFacet(attribute) &&
        !helper.state.isDisjunctiveFacet(attribute)
      ) {
        const s = helper.state.addDisjunctiveFacet(attribute);
        s.addDisjunctiveFacetRefinement(attribute, value);
        helper.setState(s);
      } else {
        const attr =
          helper.state.hierarchicalFacets.find(
            (facet) => facet.name === attribute
          )?.name || attribute;

        helper.toggleFacetRefinement(attr, value);
      }
    });
  }

  if (params.query) {
    helper.setQuery(params.query);
  }

  helper.search();
}
