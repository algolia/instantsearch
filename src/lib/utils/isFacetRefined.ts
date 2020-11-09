import { AlgoliaSearchHelper } from 'algoliasearch-helper';

export default function isFacetRefined(
  helper: AlgoliaSearchHelper,
  facet: string,
  value: string
) {
  if (helper.state.isHierarchicalFacet(facet)) {
    return helper.state.isHierarchicalFacetRefined(facet, value);
  } else if (helper.state.isConjunctiveFacet(facet)) {
    return helper.state.isFacetRefined(facet, value);
  } else {
    return helper.state.isDisjunctiveFacetRefined(facet, value);
  }
}
