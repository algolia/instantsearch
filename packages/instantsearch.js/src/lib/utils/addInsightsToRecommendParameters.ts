import algoliasearchHelper from 'algoliasearch-helper';

import type {
  PlainSearchParameters,
  RecommendParameters,
} from 'algoliasearch-helper';

/**
 * Forwards the insights-related search parameters to every Recommend query.
 *
 * The insights middleware writes `userToken` and `clickAnalytics` on the main
 * helper's search state, which only feeds search queries: Recommend queries are
 * built from their own parameters and never read the search state. Without this,
 * recommendations can't be personalized, and their responses carry no `queryID`
 * for the connectors to attribute click and conversion events with.
 *
 * Parameters set on a widget win, so an explicit `queryParameters.userToken`
 * keeps overriding the middleware.
 *
 * The fallback query is a regular search, so it gets the same treatment — but
 * only merged into a `fallbackParameters` the widget already set. See below.
 */
export function addInsightsToRecommendParameters(
  recommendParameters: RecommendParameters,
  { userToken, clickAnalytics }: PlainSearchParameters
): RecommendParameters {
  if (userToken === undefined && clickAnalytics === undefined) {
    return recommendParameters;
  }

  const insightsParameters = {
    ...(clickAnalytics === undefined ? {} : { clickAnalytics }),
    ...(userToken === undefined ? {} : { userToken }),
  };

  return new algoliasearchHelper.RecommendParameters({
    params: recommendParameters.params.map((params) => {
      // v4 `TrendingFacetsQuery` doesn't include `queryParameters` or
      // `fallbackParameters`, but the v5 API and the helper support them, like
      // `connectTrendingFacets` does.
      const { queryParameters, fallbackParameters } = params as {
        queryParameters?: PlainSearchParameters;
        fallbackParameters?: PlainSearchParameters;
      };

      return {
        ...params,
        queryParameters: {
          ...insightsParameters,
          ...queryParameters,
        },
        // Merged into a fallback the widget configured, never introduced: a
        // widget without `fallbackParameters` sends none today, and adding the
        // parameter would change the request for every one of them.
        ...(fallbackParameters && {
          fallbackParameters: {
            ...insightsParameters,
            ...fallbackParameters,
          },
        }),
      } as RecommendParameters['params'][number];
    }),
  });
}
