import { invariant } from './invariant';

import type { SearchParameters, SearchResults } from 'algoliasearch-helper';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

/**
 * Creates the empty results used until the first search returns. It is given
 * by the caller rather than imported, so that bundles that never search don't
 * include the search helper it relies on.
 */
export type CreateSearchResults = (state: SearchParameters) => SearchResults;

export function getIndexSearchResults(
  indexWidget: IndexWidget,
  createSearchResults: CreateSearchResults | undefined
) {
  const createFallbackResults = (state: SearchParameters) => {
    invariant(
      createSearchResults !== undefined,
      'The instance has no results yet, and no way to create fallback results.'
    );

    return createSearchResults(state);
  };
  const helper = indexWidget.getHelper()!;
  const results =
    // On SSR, we get the results injected on the Index.
    indexWidget.getResults() ||
    // On the browser, we create fallback results based on the helper state.
    createFallbackResults(helper.state);
  const scopedResults = indexWidget.getScopedResults().map((scopedResult) => {
    const fallbackResults =
      scopedResult.indexId === indexWidget.getIndexId()
        ? results
        : createFallbackResults(scopedResult.helper.state);

    return {
      ...scopedResult,
      // We keep `results` from being `null`.
      results: scopedResult.results || fallbackResults,
    };
  });

  return {
    results,
    scopedResults,
    recommendResults: helper.lastRecommendResults,
  };
}
