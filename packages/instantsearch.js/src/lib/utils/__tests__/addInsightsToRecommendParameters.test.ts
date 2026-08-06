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

  it('forwards them to the fallback parameters when the widget has some', () => {
    const recommendParameters =
      new algoliasearchHelper.RecommendParameters().addRelatedProducts({
        objectID: 'objectID',
        $$id: 1,
        fallbackParameters: { filters: 'brand:Apple' },
      });

    const parameters = addInsightsToRecommendParameters(recommendParameters, {
      userToken: 'my-token',
      clickAnalytics: true,
    });

    expect(parameters.params).toEqual([
      expect.objectContaining({
        fallbackParameters: {
          filters: 'brand:Apple',
          userToken: 'my-token',
          clickAnalytics: true,
        },
      }),
    ]);
  });

  it('does not introduce fallback parameters when the widget has none', () => {
    const parameters = addInsightsToRecommendParameters(
      new algoliasearchHelper.RecommendParameters().addRelatedProducts({
        objectID: 'objectID',
        $$id: 1,
        // What the connectors send when the widget declares no fallback.
        fallbackParameters: undefined,
      }),
      { userToken: 'my-token', clickAnalytics: true }
    );

    expect(parameters.params).toEqual([
      {
        objectID: 'objectID',
        model: 'related-products',
        $$id: 1,
        fallbackParameters: undefined,
        queryParameters: { userToken: 'my-token', clickAnalytics: true },
      },
    ]);
  });

  it('lets the widget fallback parameters take precedence', () => {
    const parameters = addInsightsToRecommendParameters(
      new algoliasearchHelper.RecommendParameters().addRelatedProducts({
        objectID: 'objectID',
        $$id: 1,
        fallbackParameters: {
          userToken: 'widget-token',
          clickAnalytics: false,
        },
      }),
      { userToken: 'my-token', clickAnalytics: true }
    );

    expect(parameters.params).toEqual([
      expect.objectContaining({
        fallbackParameters: {
          userToken: 'widget-token',
          clickAnalytics: false,
        },
      }),
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
