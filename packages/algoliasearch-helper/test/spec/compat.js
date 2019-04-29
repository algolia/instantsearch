'use strict';

var algoliaSearchHelper = require('../../index');
var url = algoliaSearchHelper.url;
var AlgoliaSearchHelper = algoliaSearchHelper.AlgoliaSearchHelper;

test('Should be compatible', function() {
  expect(AlgoliaSearchHelper.getConfigurationFromQueryString).toBe(url.getStateFromQueryString);
  expect(AlgoliaSearchHelper.getForeignConfigurationInQueryString).toBe(url.getUnrecognizedParametersInQueryString);
});
