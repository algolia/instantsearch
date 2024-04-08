'use strict';

var algoliasearchHelper = require('../../index');

describe('recommend()', () => {
  test('calls the algolia client with the correct number of queries', (done) => {
    var testData =
      require('../datasets/RecommendParameters/recommend.dataset')();

    var client = {
      getRecommendations: jest.fn().mockImplementationOnce(() => {
        return Promise.resolve(testData.response);
      }),
    };

    var helper = algoliasearchHelper(client, 'indexName', {});

    helper.addFrequentlyBoughtTogether({
      $$id: 1,
      objectID: 'A0E20000000279B',
    });
    helper.addTrendingFacets({ $$id: 2, facetName: 'brand' });

    // eslint-disable-next-line no-warning-comments
    // TODO: listen to "result" event when events for Recommend are implemented
    helper.on('recommend:result', (event) => {
      var results = event.recommend.results;
      // As it also includes '_state' and '_rawResults'
      expect(Object.keys(results)).toHaveLength(4);

      expect(results[1]).toBe(testData.response.results[0]);
      expect(results[2]).toBe(testData.response.results[1]);

      var state = event.recommend.state;
      expect(state.params).toEqual(testData.recommendParams.params);
      done();
    });

    helper.recommend();

    expect(client.getRecommendations).toHaveBeenCalledTimes(1);
    expect(client.getRecommendations).toHaveBeenCalledWith([
      {
        indexName: 'indexName',
        model: 'bought-together',
        objectID: 'A0E20000000279B',
        queryParameters: expect.any(Object),
      },
      {
        indexName: 'indexName',
        model: 'trending-facets',
        facetName: 'brand',
        queryParameters: expect.any(Object),
      },
    ]);
  });

  test('triggers a fetch event', (done) => {
    var client = {
      getRecommendations: jest.fn().mockImplementationOnce(() => {
        return Promise.resolve({ results: [] });
      }),
    };

    var helper = algoliasearchHelper(client, 'indexName', {});
    helper.addTrendingFacets({ $$id: 2, facetName: 'brand' });

    helper.on('fetch', (event) => {
      var state = event.recommend.state;
      expect(state).toEqual(helper.recommendState);
      done();
    });

    helper.recommend();
  });

  test('does not call the algolia client if there are no queries', () => {
    var client = {
      getRecommendations: jest.fn().mockImplementationOnce(() => {
        return Promise.resolve({ results: [] });
      }),
    };

    var helper = algoliasearchHelper(client, 'indexName', {});
    helper.recommend();

    expect(client.getRecommendations).not.toHaveBeenCalled();
  });

  test('warns if the client is not compatible with recommendations', () => {
    var message =
      'Please update algoliasearch/lite to the latest version in order to use recommendations widgets.';
    var client = {};
    console.warn = jest.fn();

    var helper = algoliasearchHelper(client, 'indexName', {});
    helper.addFrequentlyBoughtTogether({ $$id: 1 }).recommend();

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenLastCalledWith(message);
  });

  test('is not called by mutating methods', () => {
    var client = {
      getRecommendations: jest.fn().mockImplementationOnce(() => {
        return Promise.resolve({ results: [] });
      }),
    };

    var helper = algoliasearchHelper(client, 'indexName', {});

    helper.addFrequentlyBoughtTogether({ $$id: 1 });
    helper.removeFrequentlyBoughtTogether(1);
    helper.addRelatedProducts({ $$id: 2 });
    helper.removeRelatedProducts(2);
    helper.addTrendingItems({ $$id: 3 });
    helper.removeTrendingItems(3);
    helper.addTrendingFacets({ $$id: 4 });
    helper.removeTrendingFacets(4);
    helper.addLookingSimilar({ $$id: 5 });
    helper.removeLookingSimilar(5);

    expect(client.getRecommendations).not.toHaveBeenCalled();

    helper.addFrequentlyBoughtTogether({ $$id: 6 });
    helper.recommend();

    expect(client.getRecommendations).toHaveBeenCalledTimes(1);
  });

  test('adds `clickAnalytics` and `userToken` to the queries if available', () => {
    var client = {
      getRecommendations: jest.fn().mockImplementationOnce(() => {
        return Promise.resolve({ results: [] });
      }),
    };

    var helper = algoliasearchHelper(client, 'indexName', {});

    // Set `clickAnalytics` and `userToken` on the helper search state
    helper.overrideStateWithoutTriggeringChangeEvent({
      ...helper.state,
      clickAnalytics: true,
      userToken: 'userToken',
    });

    helper.addFrequentlyBoughtTogether({ $$id: 1 });
    helper.recommend();

    expect(client.getRecommendations).toHaveBeenCalledTimes(1);
    expect(client.getRecommendations).toHaveBeenLastCalledWith([
      {
        indexName: 'indexName',
        model: 'bought-together',
        queryParameters: {
          clickAnalytics: true,
          userToken: 'userToken',
        },
      },
    ]);
  });
});
