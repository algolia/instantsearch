import { getRefinements } from '../utils';

import type { Hit } from '../../types';
import type { SearchResults } from 'algoliasearch-helper';

/**
 * Strips InstantSearch metadata, which is `_`-prefixed (`_highlightResult`,
 * `_rankingInfo`, `__position`, …), so only record attributes reach the agent.
 */
export function stripInternalHitMetadata(hit: Hit): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  Object.keys(hit).forEach((key) => {
    if (!key.startsWith('_')) {
      clean[key] = (hit as Record<string, unknown>)[key];
    }
  });
  return clean;
}

/**
 * The active refinements as `facetFilters`-style groups: one group per
 * conjunctive/numeric refinement, disjunctive values of the same attribute
 * grouped together.
 */
export function buildFilters(results: SearchResults): string[][] | undefined {
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
