'use strict';

var algoliasearchHelper = require('../../../index');

test('not vulnerable to prototype pollution', () => {
  try {
    algoliasearchHelper({}, '', { constructor: { prototype: { test: 123 } } });
  } catch (e) {
    // even if it throws an error, we need to be sure no vulnerability happens
  }

  expect({}.test).toBeUndefined();
});

test('initializes RecommendParameters with params if provided through opts', () => {
  var state = {
    query: 'a query',
    recommendState: [
      { $$id: '1', objectID: 'objectID', model: 'bought-together' },
    ],
  };

  var helper = algoliasearchHelper({}, null, state);
  expect(helper.recommendState.params).toEqual(state.recommendState);
});
