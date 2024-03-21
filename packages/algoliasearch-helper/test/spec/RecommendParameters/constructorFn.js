'use strict';

var RecommendParameters = require('../../../src/RecommendParameters');

test('accepts initial parameters', () => {
  var params = [{ $$id: '1', objectID: 'objectID', model: 'bought-together' }];

  var recommendParameters = new RecommendParameters(params);
  expect(recommendParameters.params).toEqual(params);
});
