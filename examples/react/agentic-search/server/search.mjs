// Fake "regular search" engine. Understands just enough of the Algolia
// search parameters InstantSearch sends (query, page, hitsPerPage, facets,
// facetFilters) to drive the demo.

import { FACET_ATTRIBUTES, products } from './products.mjs';
import { agenticConsequence, matchesAgenticRules } from './rules.mjs';
import { keywords, matchesWord } from './text.mjs';

export const AGENT_STREAM_PATH = '/agent/stream';

/** `facetFilters` → list of OR-groups, ANDed together. */
function parseFacetFilters(facetFilters) {
  if (!facetFilters) return [];
  const list =
    typeof facetFilters === 'string' ? JSON.parse(facetFilters) : facetFilters;
  return list.map((group) =>
    (Array.isArray(group) ? group : [group]).map((filter) => {
      const separator = filter.indexOf(':');
      const attribute = filter.slice(0, separator);
      let value = filter.slice(separator + 1);
      const negated = value.startsWith('-');
      if (negated) value = value.slice(1);
      if (value.startsWith('\\-')) value = value.slice(1);
      return { attribute, value, negated };
    })
  );
}

function matchesFacetFilters(product, groups) {
  return groups.every((group) =>
    group.some(({ attribute, value, negated }) =>
      negated
        ? String(product[attribute]) !== value
        : String(product[attribute]) === value
    )
  );
}

/**
 * Text match. Keyword search needs every word to match; the broad query run
 * for an agentic request only needs one, so the sidebar still has facets for
 * "give me blue shoes" even though no product contains every word.
 */
export function matchesQuery(product, query, { broad = false } = {}) {
  const words = keywords(query);
  if (words.length === 0) return true;
  return broad
    ? words.some((word) => matchesWord(product, word))
    : words.every((word) => matchesWord(product, word));
}

function computeFacets(hits, facets) {
  // Disjunctive-facet requests send a single attribute as a string.
  const requested = typeof facets === 'string' ? [facets] : facets;
  const attributes =
    !requested || requested.length === 0
      ? []
      : requested.includes('*')
        ? FACET_ATTRIBUTES
        : requested.filter((attribute) => FACET_ATTRIBUTES.includes(attribute));

  return Object.fromEntries(
    attributes.map((attribute) => {
      const counts = {};
      hits.forEach((hit) => {
        counts[hit[attribute]] = (counts[hit[attribute]] || 0) + 1;
      });
      return [attribute, counts];
    })
  );
}

function searchOne({ indexName, params = {} }) {
  const query = params.query || '';
  const page = Number(params.page || 0);
  const hitsPerPage =
    params.hitsPerPage === undefined ? 12 : Number(params.hitsPerPage);
  const facetFilters = parseFacetFilters(params.facetFilters);
  // Evaluate the same query rules the real index has (server/rules.mjs).
  const isAgentic = matchesAgenticRules(query, params.ruleContexts);

  const run = (broad) =>
    products.filter(
      (product) =>
        matchesQuery(product, query, { broad }) &&
        matchesFacetFilters(product, facetFilters)
    );
  // Like `removeWordsIfNoResults`: a keyword search that matches nothing
  // falls back to any-word matching, so a forced regular search on a
  // sentence still shows something.
  let matching = run(isAgentic);
  if (!isAgentic && matching.length === 0) matching = run(true);

  const nbPages =
    hitsPerPage > 0 ? Math.ceil(matching.length / hitsPerPage) : 0;
  const hits =
    hitsPerPage > 0
      ? matching.slice(page * hitsPerPage, (page + 1) * hitsPerPage)
      : [];

  return {
    index: indexName,
    query,
    params: new URLSearchParams(
      Object.entries(params).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ])
    ).toString(),
    hits,
    nbHits: matching.length,
    page,
    nbPages,
    hitsPerPage,
    exhaustiveNbHits: true,
    exhaustiveFacetsCount: true,
    processingTimeMS: 1,
    facets: computeFacets(matching, params.facets),
    ...(isAgentic
      ? {
          renderingContent: agenticConsequence({ stream: AGENT_STREAM_PATH })
            .params.renderingContent,
        }
      : {}),
  };
}

/** Handles `{ requests: [{ indexName, params }] }` → `{ results: [...] }`. */
export function search({ requests = [] }) {
  return { results: requests.map(searchOne) };
}
