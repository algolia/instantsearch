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
    helper.addFrequentlyBoughtTogether({
      $$id: 1,
      objectID: 'A0E20000000279C',
    });
    helper.addTrendingFacets({ $$id: 2, facetName: 'brand' });

    // eslint-disable-next-line no-warning-comments
    // TODO: listen to "result" event when events for Recommend are implemented
    helper.on('recommend:result', (event) => {
      var results = event.recommend.results;
      // As it also includes '_state' and '_rawResults'
      expect(Object.keys(results)).toHaveLength(4);

      // This one should be sorted
      var hits = testData.response.results[0].hits;
      expect(results[1].hits).toEqual([hits[1], hits[0], hits[2]]);
      expect(results[2]).toBe(testData.response.results[2]);

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
      },
      {
        indexName: 'indexName',
        model: 'bought-together',
        objectID: 'A0E20000000279C',
      },
      { indexName: 'indexName', model: 'trending-facets', facetName: 'brand' },
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

  test('does not re-request for cached queries', () => {
    var testData =
      require('../datasets/RecommendParameters/recommend.dataset')();

    var client = {
      getRecommendations: jest.fn().mockImplementation(() => {
        return Promise.resolve(testData.response);
      }),
    };

    var helper = algoliasearchHelper(client, 'indexName', {});

    helper.addFrequentlyBoughtTogether({
      $$id: 1,
      objectID: 'A0E20000000279B',
    });

    helper.recommend();

    expect(client.getRecommendations).toHaveBeenCalledTimes(1);
    expect(client.getRecommendations).toHaveBeenLastCalledWith([
      {
        indexName: 'indexName',
        model: 'bought-together',
        objectID: 'A0E20000000279B',
      },
    ]);

    helper.once('recommend:result', () => {
      helper.addFrequentlyBoughtTogether({
        $$id: 2,
        objectID: 'A0E20000000279C',
      });

      helper.recommend();

      expect(client.getRecommendations).toHaveBeenCalledTimes(2);
      expect(client.getRecommendations).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          model: 'bought-together',
          objectID: 'A0E20000000279C',
        },
      ]);
    });
  });
});
