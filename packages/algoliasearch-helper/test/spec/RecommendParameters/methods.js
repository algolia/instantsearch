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
});

describe('removeParams', () => {
  test('removes parameters for a specific id', () => {
    var recommendParameters = new RecommendParameters([params1, params2]);

    recommendParameters = recommendParameters.removeParams('1');
    expect(recommendParameters.params).toHaveLength(1);
    expect(recommendParameters.params).toEqual([params2]);
  });
});
