'use strict';

var algoliasearchHelper = require('../../../index');

describe('_recommendChange', () => {
  test('updates the recommend state', () => {
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

  test('triggers a change event', (done) => {
    var params = { $$id: '1', objectID: 'objectID1', model: 'bought-together' };
    var helper = algoliasearchHelper({}, null, {});

    // eslint-disable-next-line no-warning-comments
    // TODO: listen to "change" event when events for Recommend are implemented
    helper.on('recommend:change', (event) => {
      var recommendState = event.recommend.state;
      expect(recommendState).toEqual(helper.recommendState);
      done();
    });

    helper._recommendChange({
      state: helper.recommendState.addParams(params),
    });
  });
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
