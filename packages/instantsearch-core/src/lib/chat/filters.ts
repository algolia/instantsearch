import { clearRefinements, getRefinements, uniq } from '../utils';
import { flat } from '../utils/flat';

import type { ApplyFiltersParams } from '../../connectors/chat/connectChat';
import type {
  AlgoliaSearchHelper,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';

/*
 * The two directions are not inverses: `getAgentFilters` folds numeric
 * refinements into the facet groups and writes excludes as `attr:-value`,
 * whereas `applyAgentFilters` reads numeric refinements from `numericFilters`
 * only and refines on `-value` literally.
 */

/**
 * The active refinements as `facetFilters`-style groups: one group per
 * conjunctive/numeric refinement, disjunctive values of the same attribute
 * grouped together.
 */
export function getAgentFilters(
  results: SearchResults
): string[][] | undefined {
  const state = results._state;
  if (!state) {
    return undefined;
  }

  const groups: string[][] = [];
  const disjunctiveGroups: Record<string, string[]> = {};

  getRefinements(results, state).forEach((refinement) => {
    if (refinement.type === 'numeric') {
      groups.push([
        `${refinement.attribute}${refinement.operator}${refinement.numericValue}`,
      ]);
      return;
    }

    const value =
      refinement.type === 'exclude'
        ? `${refinement.attribute}:-${refinement.name}`
        : `${refinement.attribute}:${refinement.name}`;

    if (refinement.type === 'disjunctive') {
      const group = disjunctiveGroups[refinement.attribute];
      if (group) {
        group.push(value);
      } else {
        const newGroup = [value];
        disjunctiveGroups[refinement.attribute] = newGroup;
        groups.push(newGroup);
      }
      return;
    }

    groups.push([value]);
  });

  return groups.length > 0 ? groups : undefined;
}

function getAttributesToClear({
  results,
  helper,
}: {
  results: SearchResults;
  helper: AlgoliaSearchHelper;
}) {
  return uniq(
    getRefinements(results, helper.state, true).map(
      (refinement) => refinement.attribute
    )
  );
}

/**
 * One Algolia `numericFilters` entry: `'price <= 1500'`. The operators are
 * exactly the set `helper.addNumericRefinement` accepts, and exactly the set
 * the Algolia MCP Server emits.
 */
const NUMERIC_FILTER = /^(.+?)\s*(<=|>=|!=|=|<|>)\s*(-?\d+(?:\.\d+)?)$/;

/**
 * Replaces the helper's refinements and query with the ones a search tool call
 * searched with, then searches.
 */
export function applyAgentFilters(
  params: ApplyFiltersParams,
  helper: AlgoliaSearchHelper
) {
  // clear all filters first
  const attributesToClear = getAttributesToClear({
    results: helper.lastResults!,
    helper,
  });

  helper.setState(
    clearRefinements({
      helper,
      attributesToClear,
    })
  );

  if (params.facetFilters) {
    const refinements = flat(params.facetFilters).reduce<
      Array<{ attribute: string; value: string }>
    >((acc, filter) => {
      const separatorIndex = filter.indexOf(':');

      if (separatorIndex > 0) {
        acc.push({
          attribute: filter.slice(0, separatorIndex),
          value: filter.slice(separatorIndex + 1),
        });
      }

      return acc;
    }, []);

    const hierarchicalRefinements = new Map<string, string>();

    refinements.forEach(({ attribute, value }) => {
      const hierarchicalFacet = helper.state.hierarchicalFacets.find(
        (facet) =>
          facet.name === attribute || facet.attributes.includes(attribute)
      );

      if (hierarchicalFacet) {
        const currentValue = hierarchicalRefinements.get(
          hierarchicalFacet.name
        );

        if (currentValue === undefined || value.length > currentValue.length) {
          hierarchicalRefinements.set(hierarchicalFacet.name, value);
        }

        return;
      }

      if (
        !helper.state.isConjunctiveFacet(attribute) &&
        !helper.state.isDisjunctiveFacet(attribute)
      ) {
        helper.setState(helper.state.addDisjunctiveFacet(attribute));
      }

      helper.toggleFacetRefinement(attribute, value);
    });

    hierarchicalRefinements.forEach((value, name) => {
      helper.toggleFacetRefinement(name, value);
    });
  }

  if (params.numericFilters) {
    params.numericFilters.forEach((filter) => {
      const match = filter.match(NUMERIC_FILTER);

      if (!match) {
        return;
      }

      const [, attribute, operator, value] = match;

      helper.addNumericRefinement(
        attribute,
        operator as SearchParameters.Operator,
        Number(value)
      );
    });
  }

  if (params.query) {
    helper.setQuery(params.query);
  }

  helper.search();

  return helper.state;
}
