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
 */
export function addInsightsToRecommendParameters(
  recommendParameters: RecommendParameters,
  { userToken, clickAnalytics }: PlainSearchParameters
): RecommendParameters {
  if (userToken === undefined && clickAnalytics === undefined) {
    return recommendParameters;
  }

  return new algoliasearchHelper.RecommendParameters({
    params: recommendParameters.params.map((params) => ({
      ...params,
      queryParameters: {
        ...(clickAnalytics === undefined ? {} : { clickAnalytics }),
        ...(userToken === undefined ? {} : { userToken }),
        ...params.queryParameters,
      },
    })),
  });
}
