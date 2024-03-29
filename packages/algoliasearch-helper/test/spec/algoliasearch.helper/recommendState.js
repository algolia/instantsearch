'use strict';

var algoliasearchHelper = require('../../../index');

describe('_recommendChange', () => {
  test('should update the recommend state', () => {
    var params1 = {
      $$id: '1',
      objectID: 'objectID1',
      model: 'bought-together',
    };
    var params2 = { $$id: '2', facetName: 'brand', model: 'trending-facets' };

    var helper = algoliasearchHelper({}, null, {});

    helper._recommendChange({
      state: helper.recommendState.addParams(params1),
    });
    expect(helper.recommendState.params).toHaveLength(1);
    expect(helper.recommendState.params).toEqual([params1]);

    helper._recommendChange({
      state: helper.recommendState.addParams(params2),
    });
    expect(helper.recommendState.params).toHaveLength(2);
    expect(helper.recommendState.params).toEqual([params1, params2]);
  });

  // eslint-disable-next-line jest/no-disabled-tests, jest/expect-expect
  test.skip('should trigger a change event', () => {});
});

describe.each([
  ['FrequentlyBoughtTogether', 'bought-together'],
  ['RelatedProducts', 'related-products'],
  ['TrendingItems', 'trending-items'],
  ['TrendingFacets', 'trending-facets'],
  ['LookingSimilar', 'looking-similar'],
])('%s', (method, model) => {
  var params = { $$id: '1' };
  var helper = algoliasearchHelper({}, null, {});

  test(`add${method} adds ${model}`, () => {
    helper[`add${method}`](params);
    expect(helper.recommendState.params).toHaveLength(1);
    expect(helper.recommendState.params).toEqual([{ $$id: '1', model }]);
  });

  test(`remove${method} removes the parameters by $$id`, () => {
    helper[`remove${method}`](params.$$id);
    expect(helper.recommendState.params).toHaveLength(0);
  });
});
