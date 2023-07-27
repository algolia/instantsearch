import { createSearchResults } from './createSearchResults';

import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

export function getIndexSearchResults(indexWidget: IndexWidget) {
  const helper = indexWidget.getHelper()!;
  const results =
    // On SSR, we get the results injected on the Index.
    indexWidget.getResults() ||
    // On the browser, we create fallback results based on the helper state.
    createSearchResults(helper.state);
  const scopedResults = indexWidget.getScopedResults().map((scopedResult) => {
    const fallbackResults =
      scopedResult.indexId === indexWidget.getIndexId()
        ? results
        : createSearchResults(scopedResult.helper.state);

    return {
      ...scopedResult,
      // We keep `results` from being `null`.
      results: scopedResult.results || fallbackResults,
    };
  });

  return {
    results,
    scopedResults,
  };
}
