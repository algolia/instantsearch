'use strict';

var algoliasearchHelper = require('../../index');

test('recommend() should call the algolia client with the correct number of queries', function (done) {
  var testData = require('../datasets/RecommendParameters/recommend.dataset')();

  var client = {
    getRecommendations: jest.fn().mockImplementationOnce(function () {
      return Promise.resolve(testData.response);
    }),
  };

  var helper = algoliasearchHelper(client, 'indexName', {});

  helper.addFrequentlyBoughtTogether({
    $$id: '1',
    objectID: 'A0E20000000279B',
  });
  helper.addTrendingFacets({ $$id: '2', facetName: 'brand' });

  helper.on('recommend:result', function (event) {
    var results = event.recommend.results;
    expect(results).toHaveLength(2);

    var state = event.recommend.state;
    expect(state.params).toEqual(testData.recommendParams.params);
    done();
  });

  helper.recommend();

  expect(client.getRecommendations).toHaveBeenCalledTimes(1);
});

test('recommend() should not call the algolia client if there are no queries', function () {
  var client = {
    getRecommendations: jest.fn().mockImplementationOnce(function () {
      return Promise.resolve({ results: [] });
    }),
  };

  var helper = algoliasearchHelper(client, 'indexName', {});
  helper.recommend();

  expect(client.getRecommendations).not.toHaveBeenCalled();
});

test('recommend() should warn if the client is not compatible with recommendations', function () {
  var message =
    'Please update algoliasearch/lite to the latest version in order to use recommendations widgets.';
  var client = {};
  console.warn = jest.fn();

  var helper = algoliasearchHelper(client, 'indexName', {});
  helper.addFrequentlyBoughtTogether({ $$id: '1' }).recommend();

  expect(console.warn).toHaveBeenCalledTimes(1);
  expect(console.warn).toHaveBeenLastCalledWith(message);
});

test('no mutating methods should trigger a recommend request', function () {
  var client = {
    getRecommendations: jest.fn().mockImplementationOnce(function () {
      return Promise.resolve({ results: [] });
    }),
  };

  var helper = algoliasearchHelper(client, 'indexName', {});

  helper.addFrequentlyBoughtTogether({ $$id: '1' });
  helper.removeFrequentlyBoughtTogether('1');
  helper.addRelatedProducts({ $$id: '2' });
  helper.removeRelatedProducts('2');
  helper.addTrendingItems({ $$id: '3' });
  helper.removeTrendingItems('3');
  helper.addTrendingFacets({ $$id: '4' });
  helper.removeTrendingFacets('4');
  helper.addLookingSimilar({ $$id: '5' });
  helper.removeLookingSimilar('5');

  expect(client.getRecommendations).not.toHaveBeenCalled();

  helper.addFrequentlyBoughtTogether({ $$id: '6' });
  helper.recommend();

  expect(client.getRecommendations).toHaveBeenCalledTimes(1);
});
