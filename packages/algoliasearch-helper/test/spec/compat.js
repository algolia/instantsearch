'use strict';

var test = require('tape');
var algoliaSearchHelper = require('../../index');
var url = algoliaSearchHelper.url;
var AlgoliaSearchHelper = algoliaSearchHelper.AlgoliaSearchHelper;

test('Should be compatible', function(t) {
  t.equal(
    AlgoliaSearchHelper.getConfigurationFromQueryString,
    url.getStateFromQueryString
  );
  t.equal(
    AlgoliaSearchHelper.getForeignConfigurationInQueryString,
    url.getUnrecognizedParametersInQueryString
  );

  t.end();
});
