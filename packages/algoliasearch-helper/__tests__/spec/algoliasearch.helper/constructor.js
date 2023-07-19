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
