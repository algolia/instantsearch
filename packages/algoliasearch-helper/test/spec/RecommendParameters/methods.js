'use strict';

var RecommendParameters = require('../../../src/RecommendParameters');

var params1 = { $$id: '1', objectID: 'objectID1', model: 'bought-together' };
var params2 = { $$id: '2', facetName: 'brand', model: 'trending-facets' };

describe('addParams', () => {
  test('appends new parameters to the existing ones', () => {
    var recommendParameters = new RecommendParameters();

    recommendParameters = recommendParameters.addParams(params1);
    expect(recommendParameters.params).toHaveLength(1);
    expect(recommendParameters.params).toEqual([params1]);

    recommendParameters = recommendParameters.addParams(params2);
    expect(recommendParameters.params).toHaveLength(2);
    expect(recommendParameters.params).toEqual([params1, params2]);
  });

  test('can have params with the same $$id', () => {
    var recommendParameters = new RecommendParameters({
      params: [params1, params2],
    });

    expect(recommendParameters.params).toHaveLength(2);
    expect(recommendParameters.params).toEqual([params1, params2]);

    var params1Updated = {
      $$id: '1',
      objectID: 'objectID2',
      model: 'bought-together',
    };

    recommendParameters = recommendParameters.addParams(params1Updated);
    expect(recommendParameters.params).toHaveLength(3);
    expect(recommendParameters.params).toEqual([
      params1,
      params2,
      params1Updated,
    ]);
  });
});

describe('removeParams', () => {
  test('removes parameters for a specific id', () => {
    var recommendParameters = new RecommendParameters({
      params: [params1, params2],
    });

    recommendParameters = recommendParameters.removeParams('1');
    expect(recommendParameters.params).toHaveLength(1);
    expect(recommendParameters.params).toEqual([params2]);
  });
});

describe.each([
  ['addFrequentlyBoughtTogether', 'bought-together'],
  ['addRelatedProducts', 'related-products'],
  ['addTrendingItems', 'trending-items'],
  ['addTrendingFacets', 'trending-facets'],
  ['addLookingSimilar', 'looking-similar'],
])('%s', (method, model) => {
  test('adds parameters with the correct model', () => {
    var recommendParameters = new RecommendParameters();

    recommendParameters = recommendParameters[method]({ $$id: '1' });
    expect(recommendParameters.params).toHaveLength(1);
    expect(recommendParameters.params).toEqual([{ $$id: '1', model: model }]);
  });
});

describe('_buildQueries', () => {
  test('returns an array of queries with the correct indexName', () => {
    var recommendParameters = new RecommendParameters({
      params: [params1, params2],
    });

    var queries = recommendParameters._buildQueries('indexName', {});
    expect(queries).toHaveLength(2);
    expect(
      queries.map(function (query) {
        return query.indexName;
      })
    ).toEqual(['indexName', 'indexName']);
  });

  test('removes $$id from the queries', () => {
    var recommendParameters = new RecommendParameters({
      params: [params1, params2],
    });

    var queries = recommendParameters._buildQueries('indexName', {});
    expect(queries).toHaveLength(2);
    expect(queries).toMatchInlineSnapshot(`
      Array [
        Object {
          "indexName": "indexName",
          "model": "bought-together",
          "objectID": "objectID1",
          "threshold": 0,
        },
        Object {
          "facetName": "brand",
          "indexName": "indexName",
          "model": "trending-facets",
          "threshold": 0,
        },
      ]
    `);
  });
});
