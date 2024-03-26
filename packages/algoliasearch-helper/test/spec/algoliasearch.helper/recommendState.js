'use strict';

var algoliasearchHelper = require('../../../index');

test('_recommendChange should update the recommend state', () => {
  var params1 = { $$id: '1', objectID: 'objectID1', model: 'bought-together' };
  var params2 = { $$id: '2', facetName: 'brand', model: 'trending-facets' };

  var helper = algoliasearchHelper({}, null, {});

  helper._recommendChange({ state: helper.recommendState.addParams(params1) });
  expect(helper.recommendState.params).toHaveLength(1);
  expect(helper.recommendState.params).toEqual([params1]);

  helper._recommendChange({ state: helper.recommendState.addParams(params2) });
  expect(helper.recommendState.params).toHaveLength(2);
  expect(helper.recommendState.params).toEqual([params1, params2]);
});

// eslint-disable-next-line jest/no-disabled-tests, jest/expect-expect
test.skip('_recommendChange should trigger a change event', () => {});
