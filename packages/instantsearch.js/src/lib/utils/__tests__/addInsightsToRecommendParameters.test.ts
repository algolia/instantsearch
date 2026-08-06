import algoliasearchHelper from 'algoliasearch-helper';

import { addInsightsToRecommendParameters } from '../addInsightsToRecommendParameters';

describe('addInsightsToRecommendParameters', () => {
  const createRecommendParameters = () =>
    new algoliasearchHelper.RecommendParameters().addRelatedProducts({
      objectID: 'objectID',
      $$id: 1,
      queryParameters: { filters: 'brand:Apple' },
    });

  it('returns the same parameters when the state has no insights parameters', () => {
    const recommendParameters = createRecommendParameters();

    expect(
      addInsightsToRecommendParameters(recommendParameters, { query: 'query' })
    ).toBe(recommendParameters);
  });

  it('forwards the user token and click analytics to every query', () => {
    const recommendParameters = createRecommendParameters().addTrendingItems({
      $$id: 2,
    });

    const parameters = addInsightsToRecommendParameters(recommendParameters, {
      userToken: 'my-token',
      clickAnalytics: true,
    });

    expect(parameters.params).toEqual([
      {
        objectID: 'objectID',
        model: 'related-products',
        $$id: 1,
        queryParameters: {
          filters: 'brand:Apple',
          userToken: 'my-token',
          clickAnalytics: true,
        },
      },
      {
        model: 'trending-items',
        $$id: 2,
        queryParameters: { userToken: 'my-token', clickAnalytics: true },
      },
    ]);
  });

  it('does not mutate the given parameters', () => {
    const recommendParameters = createRecommendParameters();

    addInsightsToRecommendParameters(recommendParameters, {
      userToken: 'my-token',
    });

    expect(recommendParameters.params).toEqual([
      {
        objectID: 'objectID',
        model: 'related-products',
        $$id: 1,
        queryParameters: { filters: 'brand:Apple' },
      },
    ]);
  });

  it('lets the widget parameters take precedence', () => {
    const recommendParameters =
      new algoliasearchHelper.RecommendParameters().addRelatedProducts({
        objectID: 'objectID',
        $$id: 1,
        queryParameters: { userToken: 'widget-token', clickAnalytics: false },
      });

    const parameters = addInsightsToRecommendParameters(recommendParameters, {
      userToken: 'my-token',
      clickAnalytics: true,
    });

    expect(parameters.params).toEqual([
      expect.objectContaining({
        queryParameters: { userToken: 'widget-token', clickAnalytics: false },
      }),
    ]);
  });
});
