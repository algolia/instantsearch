import type { InitialResults } from '../../types';
import type { AlgoliaSearchHelper } from 'algoliasearch-helper';

export function hydrateRecommendCache(
  helper: AlgoliaSearchHelper,
  initialResults: InitialResults
) {
  const recommendCache = Object.keys(initialResults).reduce(
    (acc, indexName) => {
      const initialResult = initialResults[indexName];
      if (initialResult.recommendResults) {
        return { ...acc, ...initialResult.recommendResults.results };
      }
      return acc;
    },
    {}
  );
  helper._recommendCache = recommendCache;
}
